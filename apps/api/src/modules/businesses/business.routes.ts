import { DateTime } from 'luxon'
import { Router } from 'express'
import { z } from 'zod'
import { writeAudit } from '../../lib/audit.js'
import { asyncHandler } from '../../lib/async-handler.js'
import { AppError } from '../../lib/errors.js'
import { prisma } from '../../lib/prisma.js'
import { toPublicBusiness } from '../../lib/serializers.js'
import { requireAuth, requireBusiness, requireRoles } from '../../middleware/auth.js'
import { hoursListSchema, slugSchema } from '../common/schemas.js'

const settingsSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  slug: slugSchema.optional(),
  phone: z.string().trim().max(20).nullable().optional(),
  email: z.preprocess(
    (value) => (value === '' ? null : value),
    z.string().trim().email().nullable().optional(),
  ),
  address: z.string().trim().max(240).nullable().optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  timezone: z.string().trim().min(1).max(80).optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  minAdvanceMinutes: z.number().int().min(0).max(10080).optional(),
  maxAdvanceDays: z.number().int().min(1).max(365).optional(),
  cancelMinHours: z.number().int().min(0).max(168).optional(),
  slotIntervalMinutes: z.number().int().min(5).max(180).optional(),
  bufferMinutes: z.number().int().min(0).max(180).optional(),
  autoConfirm: z.boolean().optional(),
})

export const businessRouter = Router()
businessRouter.use(asyncHandler(requireAuth), asyncHandler(requireBusiness))

businessRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const business = await prisma.business.findUniqueOrThrow({
      where: { id: req.businessId },
      include: { plan: true, workingHours: { orderBy: { weekday: 'asc' } } },
    })
    res.json({
      business: {
        ...toPublicBusiness(business),
        email: business.email,
        bufferMinutes: business.bufferMinutes,
        plan: {
          code: business.plan.code,
          name: business.plan.name,
          maxProfessionals: business.plan.maxProfessionals,
          maxAppointmentsPerMonth: business.plan.maxAppointmentsPerMonth,
        },
      },
      workingHours: business.workingHours,
    })
  }),
)

businessRouter.patch(
  '/',
  requireRoles('ADMIN'),
  asyncHandler(async (req, res) => {
    const body = settingsSchema.parse(req.body)
    if (body.timezone && !DateTime.now().setZone(body.timezone).isValid) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Fuso horário inválido')
    }
    try {
      const business = await prisma.business.update({
        where: { id: req.businessId },
        data: {
          ...body,
          email: body.email === undefined ? undefined : body.email?.toLowerCase() ?? null,
        },
        include: { plan: true },
      })
      await writeAudit(prisma, {
        businessId: business.id,
        actorId: req.user!.id,
        action: 'BUSINESS_UPDATED',
        entityType: 'Business',
        entityId: business.id,
      })
      res.json({ business: { ...toPublicBusiness(business), email: business.email, plan: business.plan } })
    } catch (error) {
      if (typeof error === 'object' && error && 'code' in error && error.code === 'P2002') {
        throw new AppError(409, 'SLUG_IN_USE', 'Este endereço já está em uso')
      }
      throw error
    }
  }),
)

const hoursSchema = z.object({ hours: hoursListSchema })

export const scheduleRouter = Router()
scheduleRouter.use(asyncHandler(requireAuth), asyncHandler(requireBusiness))

scheduleRouter.get(
  '/working-hours',
  asyncHandler(async (req, res) => {
    const hours = await prisma.businessWorkingHours.findMany({
      where: { businessId: req.businessId },
      orderBy: { weekday: 'asc' },
    })
    res.json({ hours })
  }),
)

scheduleRouter.put(
  '/working-hours',
  requireRoles('ADMIN'),
  asyncHandler(async (req, res) => {
    const { hours } = hoursSchema.parse(req.body)
    await prisma.$transaction(async (tx) => {
      await tx.businessWorkingHours.deleteMany({ where: { businessId: req.businessId } })
      await tx.businessWorkingHours.createMany({
        data: hours.map((item) => ({
          businessId: req.businessId!,
          weekday: item.weekday,
          startTime: item.startTime,
          endTime: item.endTime,
        })),
      })
    })
    res.json({ hours })
  }),
)

scheduleRouter.get(
  '/professionals/:id/working-hours',
  asyncHandler(async (req, res) => {
    if (req.membership!.role === 'PROFESSIONAL' && req.membership!.professionalId !== req.params.id) {
      throw new AppError(403, 'FORBIDDEN', 'Você só consulta a própria agenda')
    }
    const professional = await prisma.professional.findFirst({
      where: { id: req.params.id, businessId: req.businessId },
    })
    if (!professional) throw new AppError(404, 'NOT_FOUND', 'Profissional não encontrado')
    const hours = await prisma.professionalWorkingHours.findMany({
      where: { professionalId: professional.id },
      orderBy: { weekday: 'asc' },
    })
    res.json({ hours })
  }),
)

scheduleRouter.put(
  '/professionals/:id/working-hours',
  requireRoles('ADMIN'),
  asyncHandler(async (req, res) => {
    const professional = await prisma.professional.findFirst({
      where: { id: req.params.id, businessId: req.businessId },
    })
    if (!professional) throw new AppError(404, 'NOT_FOUND', 'Profissional não encontrado')
    const { hours } = hoursSchema.parse(req.body)
    await prisma.$transaction(async (tx) => {
      await tx.professionalWorkingHours.deleteMany({ where: { professionalId: professional.id } })
      if (hours.length > 0) {
        await tx.professionalWorkingHours.createMany({
          data: hours.map((item) => ({
            professionalId: professional.id,
            weekday: item.weekday,
            startTime: item.startTime,
            endTime: item.endTime,
            breakStart: item.breakStart,
            breakEnd: item.breakEnd,
          })),
        })
      }
    })
    res.json({ hours })
  }),
)

const timeOffSchema = z.object({
  professionalId: z.string().nullable().optional(),
  startsAt: z.string().refine((value) => !Number.isNaN(Date.parse(value))),
  endsAt: z.string().refine((value) => !Number.isNaN(Date.parse(value))),
  reason: z.string().trim().max(240).optional(),
})

scheduleRouter.get(
  '/time-off',
  requireRoles('ADMIN', 'PROFESSIONAL'),
  asyncHandler(async (req, res) => {
    const rows = await prisma.timeOff.findMany({
      where: {
        businessId: req.businessId,
        ...(req.membership!.role === 'PROFESSIONAL'
          ? { OR: [{ professionalId: null }, { professionalId: req.membership!.professionalId }] }
          : {}),
      },
      orderBy: { startsAt: 'asc' },
      take: 200,
    })
    res.json({ data: rows })
  }),
)

scheduleRouter.post(
  '/time-off',
  requireRoles('ADMIN', 'PROFESSIONAL'),
  asyncHandler(async (req, res) => {
    const body = timeOffSchema.parse(req.body)
    const startsAt = new Date(body.startsAt)
    const endsAt = new Date(body.endsAt)
    if (endsAt <= startsAt) throw new AppError(400, 'VALIDATION_ERROR', 'O fim do bloqueio precisa ser depois do início')
    let professionalId = body.professionalId ?? null
    if (req.membership!.role === 'PROFESSIONAL') {
      professionalId = req.membership!.professionalId
      if (!professionalId) throw new AppError(403, 'FORBIDDEN', 'Profissional sem vínculo')
    } else if (professionalId) {
      const professional = await prisma.professional.findFirst({
        where: { id: professionalId, businessId: req.businessId },
      })
      if (!professional) throw new AppError(404, 'NOT_FOUND', 'Profissional não encontrado')
    }
    const timeOff = await prisma.timeOff.create({
      data: {
        businessId: req.businessId!,
        professionalId,
        startsAt,
        endsAt,
        reason: body.reason,
      },
    })
    await writeAudit(prisma, {
      businessId: req.businessId!,
      actorId: req.user!.id,
      action: 'TIME_OFF_CREATED',
      entityType: 'TimeOff',
      entityId: timeOff.id,
    })
    res.status(201).json({ timeOff })
  }),
)

scheduleRouter.delete(
  '/time-off/:id',
  requireRoles('ADMIN', 'PROFESSIONAL'),
  asyncHandler(async (req, res) => {
    const current = await prisma.timeOff.findFirst({
      where: { id: req.params.id, businessId: req.businessId },
    })
    if (!current) throw new AppError(404, 'NOT_FOUND', 'Bloqueio não encontrado')
    if (
      req.membership!.role === 'PROFESSIONAL' &&
      current.professionalId !== req.membership!.professionalId
    ) {
      throw new AppError(403, 'FORBIDDEN', 'Você só remove os próprios bloqueios')
    }
    await prisma.timeOff.delete({ where: { id: current.id } })
    res.status(204).send()
  }),
)
