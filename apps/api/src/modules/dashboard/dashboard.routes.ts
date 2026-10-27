import { APPOINTMENT_STATUSES } from '@mp-agenda/shared'
import { Prisma } from '@prisma/client'
import { Router } from 'express'
import { DateTime } from 'luxon'
import { z } from 'zod'
import { asyncHandler } from '../../lib/async-handler.js'
import { decimalToString } from '../../lib/serializers.js'
import { prisma } from '../../lib/prisma.js'
import { requireAuth, requireBusiness } from '../../middleware/auth.js'
import { getValidated, validate } from '../../middleware/validate.js'
import { isoDateSchema } from '../common/schemas.js'

const summarySchema = z.object({
  body: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
  query: z.object({
    from: isoDateSchema.optional(),
    to: isoDateSchema.optional(),
    status: z.enum(APPOINTMENT_STATUSES).optional(),
  }),
})

export const dashboardRouter = Router()
dashboardRouter.use(asyncHandler(requireAuth), asyncHandler(requireBusiness))

dashboardRouter.get(
  '/summary',
  validate(summarySchema),
  asyncHandler(async (req, res) => {
    const { query } = getValidated<z.infer<typeof summarySchema>>(req)
    const business = await prisma.business.findUniqueOrThrow({ where: { id: req.businessId } })
    const zone = business.timezone
    const from = (query.from ? DateTime.fromISO(query.from, { zone }) : DateTime.now().setZone(zone).startOf('month'))
      .startOf('day')
    const to = (query.to ? DateTime.fromISO(query.to, { zone }) : DateTime.now().setZone(zone).endOf('month')).endOf(
      'day',
    )
    const todayStart = DateTime.now().setZone(zone).startOf('day').toUTC().toJSDate()
    const todayEnd = DateTime.now().setZone(zone).endOf('day').toUTC().toJSDate()
    const scope =
      req.membership!.role === 'PROFESSIONAL'
        ? { professionalId: req.membership!.professionalId ?? '__none__' }
        : req.membership!.role === 'CUSTOMER'
          ? { customer: { userId: req.user!.id } }
          : {}

    const periodWhere = {
      businessId: business.id,
      ...scope,
      startsAt: { gte: from.toUTC().toJSDate(), lte: to.toUTC().toJSDate() },
      ...(query.status ? { status: query.status } : {}),
    }

    const [todayCount, customerCount, upcoming, periodRows, revenue] = await Promise.all([
      prisma.appointment.count({
        where: {
          businessId: business.id,
          ...scope,
          startsAt: { gte: todayStart, lte: todayEnd },
          ...(query.status ? { status: query.status } : { status: { not: 'CANCELLED' } }),
        },
      }),
      req.membership!.role === 'CUSTOMER'
        ? prisma.customer.count({ where: { businessId: business.id, userId: req.user!.id } })
        : prisma.customer.count({ where: { businessId: business.id } }),
      prisma.appointment.findMany({
        where: {
          businessId: business.id,
          ...scope,
          startsAt: { gte: new Date() },
          status: query.status ? query.status : { in: ['PENDING', 'CONFIRMED'] },
        },
        include: {
          service: { select: { name: true } },
          professional: { select: { name: true, color: true } },
          customer: { select: { name: true } },
        },
        orderBy: { startsAt: 'asc' },
        take: 6,
      }),
      prisma.appointment.findMany({
        where: periodWhere,
        select: { status: true, serviceId: true, priceSnapshot: true, service: { select: { name: true } } },
      }),
      prisma.appointment.aggregate({
        where: {
          businessId: business.id,
          ...scope,
          startsAt: { gte: from.toUTC().toJSDate(), lte: to.toUTC().toJSDate() },
          status: { in: ['CONFIRMED', 'COMPLETED'] },
        },
        _sum: { priceSnapshot: true },
      }),
    ])

    const counts = { PENDING: 0, CONFIRMED: 0, COMPLETED: 0, CANCELLED: 0, NO_SHOW: 0 }
    const services = new Map<string, { serviceId: string; name: string; count: number }>()
    for (const row of periodRows) {
      counts[row.status] += 1
      if (row.status === 'CANCELLED') continue
      const current = services.get(row.serviceId) ?? { serviceId: row.serviceId, name: row.service.name, count: 0 }
      current.count += 1
      services.set(row.serviceId, current)
    }
    const attended = counts.COMPLETED + counts.NO_SHOW
    res.json({
      todayCount,
      customerCount,
      cancellations: counts.CANCELLED,
      estimatedRevenue: decimalToString(revenue._sum.priceSnapshot ?? new Prisma.Decimal(0)),
      topServices: [...services.values()].sort((a, b) => b.count - a.count).slice(0, 5),
      upcoming: upcoming.map((item) => ({
        id: item.id,
        startsAt: item.startsAt.toISOString(),
        status: item.status,
        serviceName: item.service.name,
        professionalName: item.professional.name,
        professionalColor: item.professional.color,
        customerName: item.customer.name,
      })),
      attendance: {
        completed: counts.COMPLETED,
        noShow: counts.NO_SHOW,
        confirmed: counts.CONFIRMED,
        pending: counts.PENDING,
        cancelled: counts.CANCELLED,
        rate: attended === 0 ? null : Number((counts.COMPLETED / attended).toFixed(4)),
      },
      period: { from: from.toISODate(), to: to.toISODate(), status: query.status ?? null },
    })
  }),
)
