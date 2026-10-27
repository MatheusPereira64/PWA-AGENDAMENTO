import type { Role } from '@mp-agenda/shared'
import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../lib/errors.js'
import { prisma } from '../lib/prisma.js'
import { verifyAccessToken } from '../lib/tokens.js'
import type { AuthUser, MembershipContext } from '../types/auth.js'

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.header('authorization')
  if (!header?.startsWith('Bearer ')) {
    next(new AppError(401, 'UNAUTHENTICATED', 'Autenticação necessária'))
    return
  }

  try {
    const userId = await verifyAccessToken(header.slice('Bearer '.length).trim())
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    })
    if (!user) {
      next(new AppError(401, 'UNAUTHENTICATED', 'Sessão inválida'))
      return
    }
    req.user = user satisfies AuthUser
    next()
  } catch {
    next(new AppError(401, 'UNAUTHENTICATED', 'Sessão expirada ou inválida'))
  }
}

export async function requireBusiness(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    next(new AppError(401, 'UNAUTHENTICATED', 'Autenticação necessária'))
    return
  }

  const memberships = await prisma.businessMembership.findMany({
    where: { userId: req.user.id },
    include: {
      business: {
        select: { id: true, name: true, slug: true, timezone: true, isDemo: true },
      },
    },
  })

  const requested = req.header('x-business-id')?.trim()
  const membership = requested
    ? memberships.find((item) => item.businessId === requested)
    : memberships.length === 1
      ? memberships[0]
      : undefined

  if (!membership) {
    next(
      new AppError(
        requested ? 403 : 400,
        requested ? 'FORBIDDEN' : 'BUSINESS_REQUIRED',
        requested
          ? 'Você não tem acesso a este negócio'
          : 'Informe o negócio no cabeçalho X-Business-Id',
      ),
    )
    return
  }

  const context: MembershipContext = {
    id: membership.id,
    role: membership.role,
    businessId: membership.businessId,
    professionalId: membership.professionalId,
    business: membership.business,
  }
  req.membership = context
  req.businessId = context.businessId
  next()
}

export function requireRoles(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.membership || !roles.includes(req.membership.role)) {
      next(new AppError(403, 'FORBIDDEN', 'Permissão insuficiente para esta ação'))
      return
    }
    next()
  }
}
