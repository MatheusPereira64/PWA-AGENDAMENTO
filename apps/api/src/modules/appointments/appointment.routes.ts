import { APPOINTMENT_STATUSES, phoneSchema } from '@mp-agenda/shared'
import { Router } from 'express'
import { z } from 'zod'
import { asyncHandler } from '../../lib/async-handler.js'
import { pageResult, parsePage } from '../../lib/pagination.js'
import { prisma } from '../../lib/prisma.js'
import { appointmentInclude, canSeeCustomerContact, toAppointmentDto } from '../../lib/serializers.js'
import { requireAuth, requireBusiness, requireRoles } from '../../middleware/auth.js'
import { getValidated, validate } from '../../middleware/validate.js'
import { instantSchema, pageQuerySchema } from '../common/schemas.js'
import { createAppointment, getAppointmentForToken, updateAppointment } from './scheduling.service.js'

const listSchema = z.object({
  body: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
  query: z.object({
    ...pageQuerySchema,
    from: instantSchema.optional(),
    to: instantSchema.optional(),
    status: z.enum(APPOINTMENT_STATUSES).optional(),
    professionalId: z.string().optional(),
  }),
})

const createSchema = z.object({
  body: z
    .object({
      serviceId: z.string().min(1),
      professionalId: z.string().min(1).optional(),
      startsAt: instantSchema,
      customerId: z.string().min(1).optional(),
      customer: z
        .object({
          name: z.string().trim().min(2).max(120),
          phone: phoneSchema,
          email: z.string().trim().email().optional(),
        })
        .optional(),
      notes: z.string().trim().max(2000).optional(),
      idempotencyKey: z.string().trim().min(8).max(80).optional(),
      status: z.enum(['PENDING', 'CONFIRMED']).optional(),
    })
    .refine((value) => value.customerId || value.customer, {
      message: 'Informe o cliente',
    }),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
})

const publicCreateSchema = z.object({
  body: z.object({
    serviceId: z.string().min(1),
    professionalId: z.string().min(1).optional(),
    startsAt: instantSchema,
    customer: z.object({
      name: z.string().trim().min(2).max(120),
      phone: phoneSchema,
      email: z.string().trim().email().optional(),
    }),
    notes: z.string().trim().max(2000).optional(),
    idempotencyKey: z.string().trim().min(8).max(80).optional(),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({ slug: z.string() }),
})

const patchSchema = z.object({
  body: z.object({
    startsAt: instantSchema.optional(),
    status: z.enum(APPOINTMENT_STATUSES).optional(),
    notes: z.string().trim().max(2000).nullable().optional(),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({ id: z.string() }),
})

const cancelSchema = z.object({
  body: z.object({ reason: z.string().trim().max(500).optional() }),
  query: z.object({}).optional().default({}),
  params: z.object({ id: z.string() }),
})

const tokenSchema = z.object({
  body: z.object({ token: z.string().min(20), reason: z.string().trim().max(500).optional() }).optional(),
  query: z.object({ token: z.string().min(20).optional() }),
  params: z.object({ id: z.string() }),
})

function filters(query: z.infer<typeof listSchema>['query'], businessId: string, role: string, userId: string, ownProfessionalId: string | null) {
  return {
    businessId,
    ...(query.status ? { status: query.status } : {}),
    ...(query.from || query.to
      ? {
          startsAt: {
            ...(query.from ? { gte: new Date(query.from) } : {}),
            ...(query.to ? { lte: new Date(query.to) } : {}),
          },
        }
      : {}),
    ...(role === 'PROFESSIONAL'
      ? { professionalId: ownProfessionalId ?? '__none__' }
      : query.professionalId
        ? { professionalId: query.professionalId }
        : {}),
    ...(role === 'CUSTOMER' ? { customer: { userId } } : {}),
    ...(query.q
      ? {
          customer: {
            ...(role === 'CUSTOMER' ? { userId } : {}),
            OR: [
              { name: { contains: query.q, mode: 'insensitive' as const } },
              { phone: { contains: query.q.replace(/\D/g, '') || query.q } },
              { email: { contains: query.q, mode: 'insensitive' as const } },
            ],
          },
        }
      : {}),
  }
}

async function businessBySlug(slug: string) {
  const business = await prisma.business.findUnique({ where: { slug } })
  if (!business) {
    const { AppError } = await import('../../lib/errors.js')
    throw new AppError(404, 'NOT_FOUND', 'Negócio não encontrado')
  }
  return business
}

export const appointmentRouter = Router()

appointmentRouter.use(asyncHandler(requireAuth), asyncHandler(requireBusiness))

appointmentRouter.get(
  '/',
  validate(listSchema),
  asyncHandler(async (req, res) => {
    const { query } = getValidated<z.infer<typeof listSchema>>(req)
    const { page, pageSize, skip } = parsePage(query)
    const where = filters(query, req.businessId!, req.membership!.role, req.user!.id, req.membership!.professionalId)
    const [total, rows] = await Promise.all([
      prisma.appointment.count({ where }),
      prisma.appointment.findMany({
        where,
        include: appointmentInclude,
        orderBy: { startsAt: 'asc' },
        skip,
        take: pageSize,
      }),
    ])
    const expose = canSeeCustomerContact(req.membership!.role) || req.membership!.role === 'CUSTOMER'
    res.json(pageResult(rows.map((row) => toAppointmentDto(row, expose)), total, page, pageSize))
  }),
)

appointmentRouter.get(
  '/export',
  requireRoles('ADMIN'),
  validate(listSchema),
  asyncHandler(async (req, res) => {
    const { query } = getValidated<z.infer<typeof listSchema>>(req)
    const where = filters(query, req.businessId!, 'ADMIN', req.user!.id, null)
    const rows = await prisma.appointment.findMany({
      where,
      include: appointmentInclude,
      orderBy: { startsAt: 'asc' },
      take: 5000,
    })
    const header = 'cliente,telefone,email,servico,profissional,inicio,fim,status,preco'
    const lines = rows.map((row) =>
      [
        row.customer.name,
        row.customer.phone,
        row.customer.email ?? '',
        row.service.name,
        row.professional.name,
        row.startsAt.toISOString(),
        row.endsAt.toISOString(),
        row.status,
        row.priceSnapshot.toFixed(2),
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(','),
    )
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="agenda.csv"')
    res.send(`\uFEFF${header}\n${lines.join('\n')}`)
  }),
)

appointmentRouter.post(
  '/',
  validate(createSchema),
  asyncHandler(async (req, res) => {
    const { body } = getValidated<z.infer<typeof createSchema>>(req)
    if (req.membership!.role === 'PROFESSIONAL') {
      if (!req.membership!.professionalId) {
        res.status(403).json({ code: 'FORBIDDEN', message: 'Profissional sem vínculo de agenda' })
        return
      }
      body.professionalId = req.membership!.professionalId
    }
    const phone = body.customer?.phone
    const result = await createAppointment({
      businessId: req.businessId!,
      actor: req.membership!.role,
      actorUserId: req.user!.id,
      serviceId: body.serviceId,
      professionalId: body.professionalId,
      startsAt: new Date(body.startsAt),
      customerId: body.customerId,
      customer: body.customer ? { ...body.customer, phone: phone ?? '' } : undefined,
      notes: body.notes,
      idempotencyKey: body.idempotencyKey,
      status: req.membership!.role === 'CUSTOMER' ? undefined : body.status,
    })
    res.status(result.reused ? 200 : 201).json({
      appointment: toAppointmentDto(result.appointment, true),
      accessToken: result.accessToken,
      reused: result.reused,
    })
  }),
)

appointmentRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const row = await prisma.appointment.findFirst({
      where: {
        id: req.params.id,
        businessId: req.businessId,
        ...(req.membership!.role === 'PROFESSIONAL'
          ? { professionalId: req.membership!.professionalId ?? '__none__' }
          : {}),
        ...(req.membership!.role === 'CUSTOMER' ? { customer: { userId: req.user!.id } } : {}),
      },
      include: appointmentInclude,
    })
    if (!row) {
      res.status(404).json({ code: 'NOT_FOUND', message: 'Agendamento não encontrado' })
      return
    }
    res.json({
      appointment: toAppointmentDto(row, canSeeCustomerContact(req.membership!.role) || req.membership!.role === 'CUSTOMER'),
    })
  }),
)

appointmentRouter.patch(
  '/:id',
  validate(patchSchema),
  asyncHandler(async (req, res) => {
    const { body } = getValidated<z.infer<typeof patchSchema>>(req)
    const updated = await updateAppointment({
      id: req.params.id,
      businessId: req.businessId!,
      actor: req.membership!.role,
      actorUserId: req.user!.id,
      professionalScopeId: req.membership!.professionalId,
      startsAt: body.startsAt ? new Date(body.startsAt) : undefined,
      status: body.status,
      notes: body.notes,
    })
    res.json({
      appointment: toAppointmentDto(updated, canSeeCustomerContact(req.membership!.role)),
    })
  }),
)

appointmentRouter.post(
  '/:id/cancel',
  validate(cancelSchema),
  asyncHandler(async (req, res) => {
    const { body } = getValidated<z.infer<typeof cancelSchema>>(req)
    const updated = await updateAppointment({
      id: req.params.id,
      businessId: req.businessId!,
      actor: req.membership!.role,
      actorUserId: req.user!.id,
      professionalScopeId: req.membership!.professionalId,
      status: 'CANCELLED',
      cancelReason: body.reason,
    })
    res.json({ appointment: toAppointmentDto(updated, canSeeCustomerContact(req.membership!.role)) })
  }),
)

export const publicAppointmentRouter = Router()

publicAppointmentRouter.post(
  '/:slug/appointments',
  validate(publicCreateSchema),
  asyncHandler(async (req, res) => {
    const { body, params } = getValidated<z.infer<typeof publicCreateSchema>>(req)
    const business = await businessBySlug(params.slug)
    const result = await createAppointment({
      businessId: business.id,
      actor: 'PUBLIC',
      serviceId: body.serviceId,
      professionalId: body.professionalId,
      startsAt: new Date(body.startsAt),
      customer: body.customer,
      notes: body.notes,
      idempotencyKey: body.idempotencyKey,
    })
    res.status(result.reused ? 200 : 201).json({
      appointment: toAppointmentDto(result.appointment, true),
      accessToken: result.accessToken,
      reused: result.reused,
      managePath: result.accessToken
        ? `/b/${business.slug}/agendamento/${result.appointment.id}?token=${result.accessToken}`
        : null,
    })
  }),
)

export const publicManageRouter = Router()

publicManageRouter.get(
  '/:id',
  validate(tokenSchema),
  asyncHandler(async (req, res) => {
    const { query } = getValidated<z.infer<typeof tokenSchema>>(req)
    if (!query.token) {
      res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Informe o token de acesso' })
      return
    }
    const appointment = await getAppointmentForToken(req.params.id, query.token)
    const business = await prisma.business.findUnique({
      where: { id: appointment.businessId },
      select: { name: true, slug: true, timezone: true, primaryColor: true, cancelMinHours: true, phone: true },
    })
    res.json({ appointment: toAppointmentDto(appointment, true), business })
  }),
)

publicManageRouter.post(
  '/:id/cancel',
  validate(tokenSchema),
  asyncHandler(async (req, res) => {
    const parsed = getValidated<z.infer<typeof tokenSchema>>(req)
    const token = parsed.body?.token ?? parsed.query.token
    if (!token) {
      res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Informe o token de acesso' })
      return
    }
    const appointment = await getAppointmentForToken(req.params.id, token)
    const updated = await updateAppointment({
      id: appointment.id,
      businessId: appointment.businessId,
      actor: 'PUBLIC',
      professionalScopeId: null,
      status: 'CANCELLED',
      cancelReason: parsed.body?.reason,
    })
    res.json({ appointment: toAppointmentDto(updated, true) })
  }),
)
