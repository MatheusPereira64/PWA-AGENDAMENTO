import { Router } from 'express'
import { z } from 'zod'
import { writeAudit } from '../../lib/audit.js'
import { asyncHandler } from '../../lib/async-handler.js'
import { AppError } from '../../lib/errors.js'
import { pageResult, parsePage } from '../../lib/pagination.js'
import { prisma } from '../../lib/prisma.js'
import { appointmentInclude, toAppointmentDto } from '../../lib/serializers.js'
import { requireAuth, requireBusiness, requireRoles } from '../../middleware/auth.js'
import { getValidated, validate } from '../../middleware/validate.js'
import { customerInputSchema, pageQuerySchema } from '../common/schemas.js'

const listSchema = z.object({
  body: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
  query: z.object(pageQuerySchema),
})

const writeSchema = z.object({
  body: customerInputSchema,
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
})

function toCustomer(customer: {
  id: string
  name: string
  email: string | null
  phone: string
  notes: string | null
  createdAt: Date
}) {
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    notes: customer.notes,
    createdAt: customer.createdAt.toISOString(),
  }
}

export const customerRouter = Router()
customerRouter.use(asyncHandler(requireAuth), asyncHandler(requireBusiness), requireRoles('ADMIN', 'PROFESSIONAL'))

customerRouter.get(
  '/',
  validate(listSchema),
  asyncHandler(async (req, res) => {
    const { query } = getValidated<z.infer<typeof listSchema>>(req)
    const { page, pageSize, skip } = parsePage(query)
    const where = {
      businessId: req.businessId!,
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: 'insensitive' as const } },
              { phone: { contains: query.q.replace(/\D/g, '') || query.q } },
              { email: { contains: query.q, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    }
    const [total, rows] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({ where, orderBy: { name: 'asc' }, skip, take: pageSize }),
    ])
    res.json(pageResult(rows.map(toCustomer), total, page, pageSize))
  }),
)

customerRouter.post(
  '/',
  requireRoles('ADMIN'),
  validate(writeSchema),
  asyncHandler(async (req, res) => {
    const { body } = getValidated<z.infer<typeof writeSchema>>(req)
    const customer = await prisma.customer.create({
      data: {
        businessId: req.businessId!,
        name: body.name,
        phone: body.phone,
        email: body.email?.toLowerCase(),
        notes: body.notes,
      },
    })
    await writeAudit(prisma, {
      businessId: req.businessId!,
      actorId: req.user!.id,
      action: 'CUSTOMER_CREATED',
      entityType: 'Customer',
      entityId: customer.id,
    })
    res.status(201).json({ customer: toCustomer(customer) })
  }),
)

customerRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const customer = await prisma.customer.findFirst({
      where: { id: req.params.id, businessId: req.businessId },
    })
    if (!customer) throw new AppError(404, 'NOT_FOUND', 'Cliente não encontrado')
    const appointments = await prisma.appointment.findMany({
      where: { customerId: customer.id, businessId: req.businessId },
      include: appointmentInclude,
      orderBy: { startsAt: 'desc' },
      take: 50,
    })
    res.json({
      customer: toCustomer(customer),
      appointments: appointments.map((item) => toAppointmentDto(item, true)),
    })
  }),
)

customerRouter.patch(
  '/:id',
  requireRoles('ADMIN'),
  asyncHandler(async (req, res) => {
    const current = await prisma.customer.findFirst({
      where: { id: req.params.id, businessId: req.businessId },
    })
    if (!current) throw new AppError(404, 'NOT_FOUND', 'Cliente não encontrado')
    const body = customerInputSchema.partial().parse(req.body)
    const customer = await prisma.customer.update({
      where: { id: current.id },
      data: {
        name: body.name,
        phone: body.phone,
        email: body.email?.toLowerCase(),
        notes: body.notes,
      },
    })
    res.json({ customer: toCustomer(customer) })
  }),
)

customerRouter.delete(
  '/:id',
  requireRoles('ADMIN'),
  asyncHandler(async (req, res) => {
    const current = await prisma.customer.findFirst({
      where: { id: req.params.id, businessId: req.businessId },
    })
    if (!current) throw new AppError(404, 'NOT_FOUND', 'Cliente não encontrado')
    const appointments = await prisma.appointment.count({ where: { customerId: current.id } })
    if (appointments > 0) {
      throw new AppError(409, 'CUSTOMER_HAS_HISTORY', 'O cliente possui atendimentos e o histórico foi preservado')
    }
    await prisma.customer.delete({ where: { id: current.id } })
    res.status(204).send()
  }),
)
