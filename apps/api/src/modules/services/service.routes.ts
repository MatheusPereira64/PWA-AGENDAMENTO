import { Router } from 'express'
import { z } from 'zod'
import { writeAudit } from '../../lib/audit.js'
import { asyncHandler } from '../../lib/async-handler.js'
import { AppError } from '../../lib/errors.js'
import { pageResult, parsePage } from '../../lib/pagination.js'
import { prisma } from '../../lib/prisma.js'
import { toServiceDto } from '../../lib/serializers.js'
import { requireAuth, requireBusiness, requireRoles } from '../../middleware/auth.js'
import { getValidated, validate } from '../../middleware/validate.js'
import { pageQuerySchema, priceSchema } from '../common/schemas.js'

const writeSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120),
    description: z.string().trim().max(2000).nullable().optional(),
    durationMinutes: z.number().int().min(5).max(480),
    price: priceSchema,
    bufferMinutes: z.number().int().min(0).max(180).optional(),
    active: z.boolean().optional(),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({ id: z.string().optional() }).optional().default({}),
})

const listSchema = z.object({
  body: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
  query: z.object({
    ...pageQuerySchema,
    active: z.enum(['true', 'false']).optional(),
  }),
})

export const serviceRouter = Router()
serviceRouter.use(asyncHandler(requireAuth), asyncHandler(requireBusiness))

serviceRouter.get(
  '/',
  validate(listSchema),
  asyncHandler(async (req, res) => {
    const { query } = getValidated<z.infer<typeof listSchema>>(req)
    const { page, pageSize, skip } = parsePage(query)
    const where = {
      businessId: req.businessId!,
      ...(query.active ? { active: query.active === 'true' } : {}),
      ...(query.q ? { name: { contains: query.q, mode: 'insensitive' as const } } : {}),
    }
    const [total, rows] = await Promise.all([
      prisma.service.count({ where }),
      prisma.service.findMany({ where, orderBy: { name: 'asc' }, skip, take: pageSize }),
    ])
    res.json(pageResult(rows.map(toServiceDto), total, page, pageSize))
  }),
)

serviceRouter.post(
  '/',
  requireRoles('ADMIN'),
  validate(writeSchema),
  asyncHandler(async (req, res) => {
    const { body } = getValidated<z.infer<typeof writeSchema>>(req)
    const business = await prisma.business.findUniqueOrThrow({ where: { id: req.businessId } })
    const service = await prisma.service.create({
      data: {
        businessId: business.id,
        name: body.name,
        description: body.description,
        durationMinutes: body.durationMinutes,
        price: body.price,
        bufferMinutes: body.bufferMinutes ?? business.bufferMinutes,
        active: body.active ?? true,
      },
    })
    await writeAudit(prisma, {
      businessId: business.id,
      actorId: req.user!.id,
      action: 'SERVICE_CREATED',
      entityType: 'Service',
      entityId: service.id,
    })
    res.status(201).json({ service: toServiceDto(service) })
  }),
)

serviceRouter.patch(
  '/:id',
  requireRoles('ADMIN'),
  asyncHandler(async (req, res) => {
    const current = await prisma.service.findFirst({
      where: { id: req.params.id, businessId: req.businessId },
    })
    if (!current) throw new AppError(404, 'NOT_FOUND', 'Serviço não encontrado')
    const body = req.body as Partial<z.infer<typeof writeSchema>['body']>
    const parsed = writeSchema.shape.body.partial().parse(body)
    const service = await prisma.service.update({
      where: { id: current.id },
      data: {
        name: parsed.name,
        description: parsed.description,
        durationMinutes: parsed.durationMinutes,
        price: parsed.price,
        bufferMinutes: parsed.bufferMinutes,
        active: parsed.active,
      },
    })
    await writeAudit(prisma, {
      businessId: req.businessId!,
      actorId: req.user!.id,
      action: 'SERVICE_UPDATED',
      entityType: 'Service',
      entityId: service.id,
    })
    res.json({ service: toServiceDto(service) })
  }),
)

serviceRouter.delete(
  '/:id',
  requireRoles('ADMIN'),
  asyncHandler(async (req, res) => {
    const current = await prisma.service.findFirst({
      where: { id: req.params.id, businessId: req.businessId },
    })
    if (!current) throw new AppError(404, 'NOT_FOUND', 'Serviço não encontrado')
    const appointments = await prisma.appointment.count({ where: { serviceId: current.id } })
    if (appointments > 0) {
      const service = await prisma.service.update({
        where: { id: current.id },
        data: { active: false },
      })
      res.json({ service: toServiceDto(service), archived: true })
      return
    }
    await prisma.service.delete({ where: { id: current.id } })
    res.status(204).send()
  }),
)
