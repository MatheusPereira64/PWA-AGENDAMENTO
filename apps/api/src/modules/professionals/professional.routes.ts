import { Prisma } from '@prisma/client'
import { Router } from 'express'
import { z } from 'zod'
import { writeAudit } from '../../lib/audit.js'
import { asyncHandler } from '../../lib/async-handler.js'
import { AppError } from '../../lib/errors.js'
import { hashPassword } from '../../lib/password.js'
import { pageResult, parsePage } from '../../lib/pagination.js'
import { prisma } from '../../lib/prisma.js'
import { toProfessionalDto } from '../../lib/serializers.js'
import { requireAuth, requireBusiness, requireRoles } from '../../middleware/auth.js'
import { getValidated, validate } from '../../middleware/validate.js'
import { emailSchema, passwordSchema, phoneSchema } from '@mp-agenda/shared'
import { pageQuerySchema } from '../common/schemas.js'

const professionalInclude = { services: { select: { serviceId: true } } } as const

const writeSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120),
    email: emailSchema.optional(),
    phone: phoneSchema.optional(),
    bio: z.string().trim().max(2000).nullable().optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    active: z.boolean().optional(),
    serviceIds: z.array(z.string()).optional(),
    password: passwordSchema.optional(),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
})

const listSchema = z.object({
  body: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
  query: z.object({
    ...pageQuerySchema,
    active: z.enum(['true', 'false']).optional(),
    serviceId: z.string().optional(),
  }),
})

async function assertServices(businessId: string, serviceIds: string[]) {
  if (serviceIds.length === 0) return
  const count = await prisma.service.count({
    where: { businessId, id: { in: serviceIds } },
  })
  if (count !== new Set(serviceIds).size) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Há serviços que não pertencem a este negócio')
  }
}

export const professionalRouter = Router()
professionalRouter.use(asyncHandler(requireAuth), asyncHandler(requireBusiness))

professionalRouter.get(
  '/',
  validate(listSchema),
  asyncHandler(async (req, res) => {
    const { query } = getValidated<z.infer<typeof listSchema>>(req)
    const { page, pageSize, skip } = parsePage(query)
    const where = {
      businessId: req.businessId!,
      ...(req.membership!.role === 'PROFESSIONAL'
        ? { id: req.membership!.professionalId ?? '__none__' }
        : {}),
      ...(query.active ? { active: query.active === 'true' } : {}),
      ...(query.serviceId ? { services: { some: { serviceId: query.serviceId } } } : {}),
      ...(query.q ? { name: { contains: query.q, mode: 'insensitive' as const } } : {}),
    }
    const [total, rows] = await Promise.all([
      prisma.professional.count({ where }),
      prisma.professional.findMany({
        where,
        include: professionalInclude,
        orderBy: { name: 'asc' },
        skip,
        take: pageSize,
      }),
    ])
    const hideContact = req.membership!.role === 'CUSTOMER'
    res.json(
      pageResult(
        rows.map((row) => toProfessionalDto(row, { publicView: hideContact })),
        total,
        page,
        pageSize,
      ),
    )
  }),
)

professionalRouter.post(
  '/',
  requireRoles('ADMIN'),
  validate(writeSchema),
  asyncHandler(async (req, res) => {
    const { body } = getValidated<z.infer<typeof writeSchema>>(req)
    if (body.password && !body.email) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Informe o e-mail para criar o acesso do profissional')
    }
    await assertServices(req.businessId!, body.serviceIds ?? [])
    const business = await prisma.business.findUniqueOrThrow({
      where: { id: req.businessId },
      include: { plan: true },
    })
    const activeCount = await prisma.professional.count({
      where: { businessId: business.id, active: true },
    })
    if (activeCount >= business.plan.maxProfessionals) {
      throw new AppError(403, 'PLAN_LIMIT', 'O plano atual atingiu o limite de profissionais')
    }

    try {
      const professional = await prisma.$transaction(async (tx) => {
        let userId: string | undefined
        if (body.password && body.email) {
          const user = await tx.user.create({
            data: {
              name: body.name,
              email: body.email.toLowerCase(),
              passwordHash: await hashPassword(body.password),
            },
          })
          userId = user.id
        }
        const created = await tx.professional.create({
          data: {
            businessId: business.id,
            userId,
            name: body.name,
            email: body.email?.toLowerCase(),
            phone: body.phone,
            bio: body.bio,
            color: body.color,
            active: body.active ?? true,
            services: {
              create: (body.serviceIds ?? []).map((serviceId) => ({ serviceId })),
            },
          },
          include: professionalInclude,
        })
        if (userId) {
          await tx.businessMembership.create({
            data: {
              userId,
              businessId: business.id,
              role: 'PROFESSIONAL',
              professionalId: created.id,
            },
          })
        }
        await writeAudit(tx, {
          businessId: business.id,
          actorId: req.user!.id,
          action: 'PROFESSIONAL_CREATED',
          entityType: 'Professional',
          entityId: created.id,
        })
        return created
      })
      res.status(201).json({ professional: toProfessionalDto(professional) })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new AppError(409, 'EMAIL_IN_USE', 'Este e-mail já está em uso')
      }
      throw error
    }
  }),
)

professionalRouter.patch(
  '/:id',
  requireRoles('ADMIN'),
  asyncHandler(async (req, res) => {
    const current = await prisma.professional.findFirst({
      where: { id: req.params.id, businessId: req.businessId },
    })
    if (!current) throw new AppError(404, 'NOT_FOUND', 'Profissional não encontrado')
    const body = writeSchema.shape.body.partial().parse(req.body)
    if (body.serviceIds) await assertServices(req.businessId!, body.serviceIds)
    const professional = await prisma.$transaction(async (tx) => {
      if (body.serviceIds) {
        await tx.professionalService.deleteMany({ where: { professionalId: current.id } })
        await tx.professionalService.createMany({
          data: body.serviceIds.map((serviceId) => ({ professionalId: current.id, serviceId })),
        })
      }
      return tx.professional.update({
        where: { id: current.id },
        data: {
          name: body.name,
          email: body.email?.toLowerCase(),
          phone: body.phone,
          bio: body.bio,
          color: body.color,
          active: body.active,
        },
        include: professionalInclude,
      })
    })
    await writeAudit(prisma, {
      businessId: req.businessId!,
      actorId: req.user!.id,
      action: 'PROFESSIONAL_UPDATED',
      entityType: 'Professional',
      entityId: professional.id,
    })
    res.json({ professional: toProfessionalDto(professional) })
  }),
)

professionalRouter.delete(
  '/:id',
  requireRoles('ADMIN'),
  asyncHandler(async (req, res) => {
    const current = await prisma.professional.findFirst({
      where: { id: req.params.id, businessId: req.businessId },
    })
    if (!current) throw new AppError(404, 'NOT_FOUND', 'Profissional não encontrado')
    const appointments = await prisma.appointment.count({ where: { professionalId: current.id } })
    if (appointments > 0 || current.userId) {
      const professional = await prisma.professional.update({
        where: { id: current.id },
        data: { active: false },
        include: professionalInclude,
      })
      res.json({ professional: toProfessionalDto(professional), archived: true })
      return
    }
    await prisma.professional.delete({ where: { id: current.id } })
    res.status(204).send()
  }),
)
