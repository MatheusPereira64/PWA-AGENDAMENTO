import { Router } from 'express'
import { z } from 'zod'
import { asyncHandler } from '../../lib/async-handler.js'
import { prisma } from '../../lib/prisma.js'
import { toProfessionalDto, toPublicBusiness, toServiceDto } from '../../lib/serializers.js'
import { getValidated, validate } from '../../middleware/validate.js'
import { getAvailability } from '../availability/availability.service.js'
import { isoDateSchema } from '../common/schemas.js'

const availabilityQuery = z.object({
  body: z.object({}).optional().default({}),
  params: z.object({ slug: z.string() }),
  query: z.object({
    serviceId: z.string().min(1),
    date: isoDateSchema,
    professionalId: z.string().optional(),
  }),
})

async function publicBusiness(slug: string) {
  const business = await prisma.business.findUnique({ where: { slug } })
  if (!business) return null
  return business
}

export const publicBusinessRouter = Router()

publicBusinessRouter.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const business = await publicBusiness(req.params.slug)
    if (!business) {
      res.status(404).json({ code: 'NOT_FOUND', message: 'Negócio não encontrado' })
      return
    }
    res.json({ business: toPublicBusiness(business) })
  }),
)

publicBusinessRouter.get(
  '/:slug/services',
  asyncHandler(async (req, res) => {
    const business = await publicBusiness(req.params.slug)
    if (!business) {
      res.status(404).json({ code: 'NOT_FOUND', message: 'Negócio não encontrado' })
      return
    }
    const services = await prisma.service.findMany({
      where: { businessId: business.id, active: true },
      orderBy: { name: 'asc' },
    })
    res.json({ data: services.map(toServiceDto) })
  }),
)

publicBusinessRouter.get(
  '/:slug/professionals',
  asyncHandler(async (req, res) => {
    const business = await publicBusiness(req.params.slug)
    if (!business) {
      res.status(404).json({ code: 'NOT_FOUND', message: 'Negócio não encontrado' })
      return
    }
    const serviceId = typeof req.query.serviceId === 'string' ? req.query.serviceId : undefined
    const professionals = await prisma.professional.findMany({
      where: {
        businessId: business.id,
        active: true,
        ...(serviceId ? { services: { some: { serviceId } } } : {}),
      },
      include: { services: { select: { serviceId: true } } },
      orderBy: { name: 'asc' },
    })
    res.json({ data: professionals.map((item) => toProfessionalDto(item, { publicView: true })) })
  }),
)

publicBusinessRouter.get(
  '/:slug/availability',
  validate(availabilityQuery),
  asyncHandler(async (req, res) => {
    const { params, query } = getValidated<z.infer<typeof availabilityQuery>>(req)
    const business = await publicBusiness(params.slug)
    if (!business) {
      res.status(404).json({ code: 'NOT_FOUND', message: 'Negócio não encontrado' })
      return
    }
    const availability = await getAvailability({
      businessId: business.id,
      serviceId: query.serviceId,
      date: query.date,
      professionalId: query.professionalId,
    })
    res.json(availability)
  }),
)

export const availabilityRouter = Router()

availabilityRouter.get(
  '/',
  validate(
    z.object({
      body: z.object({}).optional().default({}),
      params: z.object({}).optional().default({}),
      query: z.object({
        serviceId: z.string().min(1),
        date: isoDateSchema,
        professionalId: z.string().optional(),
      }),
    }),
  ),
  asyncHandler(async (req, res) => {
    const { query } = getValidated<{
      query: { serviceId: string; date: string; professionalId?: string }
    }>(req)
    const availability = await getAvailability({
      businessId: req.businessId!,
      serviceId: query.serviceId,
      date: query.date,
      professionalId:
        req.membership?.role === 'PROFESSIONAL'
          ? req.membership.professionalId ?? undefined
          : query.professionalId,
    })
    res.json(availability)
  }),
)
