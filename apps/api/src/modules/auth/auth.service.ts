import { Prisma } from '@prisma/client'
import { DateTime } from 'luxon'
import { env, cookieSecure } from '../../config/env.js'
import { AppError } from '../../lib/errors.js'
import type { Mailer } from '../../lib/mailer.js'
import { hashPassword, verifyPassword } from '../../lib/password.js'
import { prisma } from '../../lib/prisma.js'
import { hashToken, randomToken, signAccessToken } from '../../lib/tokens.js'
import { writeAudit } from '../../lib/audit.js'

export const REFRESH_COOKIE = 'mp_refresh'

const GENERIC_LOGIN_ERROR = 'E-mail ou senha inválidos'

export function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: cookieSecure ? ('none' as const) : ('lax' as const),
    path: '/api/auth',
    maxAge: env.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000,
  }
}

export async function loadProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      memberships: {
        include: {
          business: {
            select: {
              id: true,
              name: true,
              slug: true,
              timezone: true,
              isDemo: true,
              primaryColor: true,
              accentColor: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  })
  if (!user) throw new AppError(401, 'UNAUTHENTICATED', 'Sessão inválida')
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    memberships: user.memberships.map((membership) => ({
      id: membership.id,
      role: membership.role,
      professionalId: membership.professionalId,
      business: membership.business,
    })),
  }
}

async function issueSession(userId: string, userAgent?: string) {
  const accessToken = await signAccessToken(userId)
  const refreshToken = randomToken()
  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(refreshToken),
      expiresAt: DateTime.utc().plus({ days: env.JWT_REFRESH_TTL_DAYS }).toJSDate(),
      userAgent: userAgent?.slice(0, 255),
    },
  })
  const user = await loadProfile(userId)
  return { accessToken, refreshToken, user }
}

function uniqueField(error: Prisma.PrismaClientKnownRequestError) {
  return String(error.meta?.target ?? '')
}

export async function registerBusiness(input: {
  name: string
  email: string
  password: string
  businessName: string
  slug: string
  phone?: string
  timezone?: string
  userAgent?: string
}) {
  const passwordHash = await hashPassword(input.password)
  try {
    const created = await prisma.$transaction(async (tx) => {
      const plan = await tx.plan.upsert({
        where: { code: 'free' },
        update: {},
        create: {
          code: 'free',
          name: 'Gratuito',
          maxProfessionals: 5,
          maxAppointmentsPerMonth: 300,
        },
      })
      const user = await tx.user.create({
        data: {
          name: input.name,
          email: input.email.toLowerCase(),
          passwordHash,
        },
      })
      const business = await tx.business.create({
        data: {
          name: input.businessName,
          slug: input.slug,
          phone: input.phone,
          timezone: input.timezone ?? 'America/Sao_Paulo',
          planId: plan.id,
          workingHours: {
            create: [1, 2, 3, 4, 5].map((weekday) => ({
              weekday,
              startTime: '09:00',
              endTime: '18:00',
            })),
          },
        },
      })
      await tx.businessMembership.create({
        data: { userId: user.id, businessId: business.id, role: 'ADMIN' },
      })
      await writeAudit(tx, {
        businessId: business.id,
        actorId: user.id,
        action: 'BUSINESS_CREATED',
        entityType: 'Business',
        entityId: business.id,
      })
      return user.id
    })
    return issueSession(created, input.userAgent)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const field = uniqueField(error)
      if (field.includes('email')) throw new AppError(409, 'EMAIL_IN_USE', 'Este e-mail já está em uso')
      if (field.includes('slug')) throw new AppError(409, 'SLUG_IN_USE', 'Este endereço já está em uso')
    }
    throw error
  }
}

export async function registerCustomer(input: {
  businessSlug: string
  name: string
  email: string
  password: string
  phone: string
  userAgent?: string
}) {
  const business = await prisma.business.findUnique({ where: { slug: input.businessSlug } })
  if (!business) throw new AppError(404, 'NOT_FOUND', 'Negócio não encontrado')
  const passwordHash = await hashPassword(input.password)
  const email = input.email.toLowerCase()

  try {
    const userId = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { name: input.name, email, passwordHash },
      })
      await tx.businessMembership.create({
        data: { userId: user.id, businessId: business.id, role: 'CUSTOMER' },
      })
      const existing = await tx.customer.findFirst({
        where: { businessId: business.id, OR: [{ phone: input.phone }, { email }] },
      })
      if (existing?.userId && existing.userId !== user.id) {
        throw new AppError(409, 'CUSTOMER_CONFLICT', 'Este telefone ou e-mail já está vinculado a outra conta')
      }
      if (existing) {
        await tx.customer.update({
          where: { id: existing.id },
          data: { name: input.name, phone: input.phone, email, userId: user.id },
        })
      } else {
        await tx.customer.create({
          data: {
            businessId: business.id,
            userId: user.id,
            name: input.name,
            phone: input.phone,
            email,
          },
        })
      }
      return user.id
    })
    return issueSession(userId, input.userAgent)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new AppError(409, 'EMAIL_IN_USE', 'Este e-mail já está em uso')
    }
    throw error
  }
}

export async function login(input: { email: string; password: string; userAgent?: string }) {
  const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } })
  if (!user) throw new AppError(401, 'INVALID_CREDENTIALS', GENERIC_LOGIN_ERROR)
  const valid = await verifyPassword(input.password, user.passwordHash)
  if (!valid) throw new AppError(401, 'INVALID_CREDENTIALS', GENERIC_LOGIN_ERROR)
  return issueSession(user.id, input.userAgent)
}

export async function rotateRefreshToken(rawToken: string | undefined, userAgent?: string) {
  if (!rawToken) throw new AppError(401, 'UNAUTHENTICATED', 'Sessão não encontrada')
  const tokenHash = hashToken(rawToken)
  const existing = await prisma.refreshToken.findUnique({ where: { tokenHash } })
  if (!existing) throw new AppError(401, 'UNAUTHENTICATED', 'Sessão inválida')
  if (existing.revokedAt) {
    const rotatedRecently = Date.now() - existing.revokedAt.getTime() < 15_000
    if (!rotatedRecently) {
      await prisma.refreshToken.updateMany({
        where: { userId: existing.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      })
    }
    throw new AppError(401, 'UNAUTHENTICATED', 'Sessão revogada')
  }
  if (existing.expiresAt < new Date()) {
    throw new AppError(401, 'UNAUTHENTICATED', 'Sessão expirada')
  }
  await prisma.refreshToken.update({
    where: { id: existing.id },
    data: { revokedAt: new Date() },
  })
  return issueSession(existing.userId, userAgent)
}

export async function logout(rawToken: string | undefined) {
  if (!rawToken) return
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashToken(rawToken), revokedAt: null },
    data: { revokedAt: new Date() },
  })
}

export async function requestPasswordReset(email: string, mailer: Mailer) {
  if (!mailer.isConfigured()) {
    throw new AppError(
      503,
      'EMAIL_NOT_CONFIGURED',
      'A recuperação de senha depende de e-mail transacional. Configure SMTP_HOST e SMTP_FROM. Nenhum e-mail foi simulado.',
    )
  }
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (!user) {
    return { message: 'Se o e-mail existir, enviaremos as instruções de redefinição.' }
  }
  const raw = randomToken()
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(raw),
      expiresAt: DateTime.utc().plus({ hours: 1 }).toJSDate(),
    },
  })
  const link = `${env.APP_URL}/redefinir-senha?token=${encodeURIComponent(raw)}`
  await mailer.send({
    to: user.email,
    subject: 'Redefinição de senha — MP Agenda',
    text: `Para definir uma nova senha, abra este link na próxima hora:\n${link}\n\nSe você não pediu a redefinição, ignore este e-mail.`,
  })
  return { message: 'Se o e-mail existir, enviaremos as instruções de redefinição.' }
}

export async function resetPassword(token: string, password: string) {
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
  })
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    throw new AppError(400, 'INVALID_TOKEN', 'Link inválido ou expirado')
  }
  const passwordHash = await hashPassword(password)
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    prisma.refreshToken.updateMany({
      where: { userId: record.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ])
  return { message: 'Senha atualizada. Entre novamente.' }
}
