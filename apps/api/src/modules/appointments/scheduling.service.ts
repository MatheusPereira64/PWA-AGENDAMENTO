import { canTransition, OCCUPYING_STATUSES, type AppointmentStatus } from '@mp-agenda/shared'
import { Prisma, type AppointmentStatus as PrismaStatus, type Service } from '@prisma/client'
import { DateTime } from 'luxon'
import { writeAudit } from '../../lib/audit.js'
import { AppError, isSlotConflict } from '../../lib/errors.js'
import { prisma } from '../../lib/prisma.js'
import { hashToken, randomToken } from '../../lib/tokens.js'
import { appointmentInclude } from '../../lib/serializers.js'
import { evaluateSlot, resolveWorkingHours } from '../availability/slots.js'
import { cancellationDecision, type ActorRole } from './policy.js'

const occupying = [...OCCUPYING_STATUSES] as PrismaStatus[]

type CreateInput = {
  businessId: string
  actor: ActorRole
  actorUserId?: string
  serviceId: string
  professionalId?: string
  startsAt: Date
  customerId?: string
  customer?: { name: string; phone: string; email?: string }
  notes?: string
  idempotencyKey?: string
  status?: 'PENDING' | 'CONFIRMED'
}

async function lockProfessionals(tx: Prisma.TransactionClient, ids: string[]) {
  const ordered = [...new Set(ids)].sort()
  if (ordered.length === 0) return
  await tx.$queryRaw`SELECT id FROM "Professional" WHERE id IN (${Prisma.join(ordered)}) ORDER BY id FOR UPDATE`
}

async function assertProfessionalSlot(
  tx: Prisma.TransactionClient,
  input: {
    business: {
      id: string
      timezone: string
      slotIntervalMinutes: number
      minAdvanceMinutes: number
      maxAdvanceDays: number
    }
    service: Pick<Service, 'durationMinutes' | 'bufferMinutes'>
    professionalId: string
    startsAt: Date
    excludeAppointmentId?: string
  },
) {
  const zoned = DateTime.fromJSDate(input.startsAt, { zone: 'utc' }).setZone(input.business.timezone)
  const weekday = zoned.weekday
  const [professionalHours, businessHours, busy, timeOff] = await Promise.all([
    tx.professionalWorkingHours.findMany({ where: { professionalId: input.professionalId } }),
    tx.businessWorkingHours.findUnique({
      where: { businessId_weekday: { businessId: input.business.id, weekday } },
    }),
    tx.appointment.findMany({
      where: {
        professionalId: input.professionalId,
        status: { in: occupying },
        ...(input.excludeAppointmentId ? { id: { not: input.excludeAppointmentId } } : {}),
        startsAt: { lt: DateTime.fromJSDate(input.startsAt).plus({ days: 2 }).toJSDate() },
        blockedUntil: { gt: DateTime.fromJSDate(input.startsAt).minus({ days: 1 }).toJSDate() },
      },
      select: { startsAt: true, blockedUntil: true },
    }),
    tx.timeOff.findMany({
      where: {
        businessId: input.business.id,
        startsAt: { lt: DateTime.fromJSDate(input.startsAt).plus({ days: 2 }).toJSDate() },
        endsAt: { gt: DateTime.fromJSDate(input.startsAt).minus({ days: 1 }).toJSDate() },
        OR: [{ professionalId: null }, { professionalId: input.professionalId }],
      },
    }),
  ])

  const decision = evaluateSlot({
    timezone: input.business.timezone,
    startsAt: input.startsAt,
    durationMinutes: input.service.durationMinutes,
    bufferMinutes: input.service.bufferMinutes,
    slotIntervalMinutes: input.business.slotIntervalMinutes,
    minAdvanceMinutes: input.business.minAdvanceMinutes,
    maxAdvanceDays: input.business.maxAdvanceDays,
    now: new Date(),
    workingHours: resolveWorkingHours(professionalHours, businessHours, weekday),
    busy,
    timeOff,
  })
  if (!decision.ok) throw new AppError(409, 'SLOT_UNAVAILABLE', decision.reason)
  return decision
}

async function resolveCustomer(
  tx: Prisma.TransactionClient,
  input: CreateInput,
) {
  if (input.customerId) {
    const customer = await tx.customer.findFirst({
      where: { id: input.customerId, businessId: input.businessId },
    })
    if (!customer) throw new AppError(404, 'NOT_FOUND', 'Cliente não encontrado')
    if (input.actor === 'CUSTOMER' && customer.userId !== input.actorUserId) {
      throw new AppError(403, 'FORBIDDEN', 'Você só pode agendar em seu próprio nome')
    }
    return customer
  }

  if (input.actor === 'CUSTOMER' && input.actorUserId && !input.customer) {
    const own = await tx.customer.findFirst({
      where: { businessId: input.businessId, userId: input.actorUserId },
    })
    if (!own) throw new AppError(400, 'VALIDATION_ERROR', 'Informe os dados do cliente')
    return own
  }

  if (!input.customer) throw new AppError(400, 'VALIDATION_ERROR', 'Informe os dados do cliente')
  const email = input.customer.email?.toLowerCase()
  let customer = await tx.customer.findFirst({
    where: { businessId: input.businessId, phone: input.customer.phone },
  })
  if (!customer && email) {
    customer = await tx.customer.findFirst({
      where: { businessId: input.businessId, email },
    })
  }

  let linkedUserId = input.actor === 'CUSTOMER' ? input.actorUserId : undefined
  if (!linkedUserId && email) {
    const account = await tx.user.findUnique({ where: { email } })
    if (account) {
      const membership = await tx.businessMembership.findUnique({
        where: { userId_businessId: { userId: account.id, businessId: input.businessId } },
      })
      if (membership?.role === 'CUSTOMER') linkedUserId = account.id
    }
  }

  if (customer) {
    if (customer.userId && linkedUserId && customer.userId !== linkedUserId) {
      throw new AppError(409, 'CUSTOMER_CONFLICT', 'Este contato já está vinculado a outra conta')
    }
    return tx.customer.update({
      where: { id: customer.id },
      data: {
        name: input.customer.name,
        email: email ?? customer.email,
        userId: customer.userId ?? linkedUserId,
      },
    })
  }

  return tx.customer.create({
    data: {
      businessId: input.businessId,
      name: input.customer.name,
      phone: input.customer.phone,
      email,
      userId: linkedUserId,
    },
  })
}

async function findIdempotent(businessId: string, idempotencyKey: string) {
  return prisma.appointment.findUnique({
    where: { businessId_idempotencyKey: { businessId, idempotencyKey } },
    include: appointmentInclude,
  })
}

export async function createAppointment(input: CreateInput) {
  if (input.idempotencyKey) {
    const existing = await findIdempotent(input.businessId, input.idempotencyKey)
    if (existing) return { appointment: existing, accessToken: null as string | null, reused: true }
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const business = await tx.business.findUnique({
        where: { id: input.businessId },
        include: { plan: true },
      })
      if (!business) throw new AppError(404, 'NOT_FOUND', 'Negócio não encontrado')

      const service = await tx.service.findFirst({
        where: { id: input.serviceId, businessId: business.id, active: true },
      })
      if (!service) throw new AppError(404, 'NOT_FOUND', 'Serviço não encontrado')

      const monthStart = DateTime.now().setZone(business.timezone).startOf('month').toUTC().toJSDate()
      const monthCount = await tx.appointment.count({
        where: {
          businessId: business.id,
          createdAt: { gte: monthStart },
          status: { not: 'CANCELLED' },
        },
      })
      if (monthCount >= business.plan.maxAppointmentsPerMonth) {
        throw new AppError(403, 'PLAN_LIMIT', 'O plano atual atingiu o limite de agendamentos do mês')
      }

      const professionals = await tx.professional.findMany({
        where: {
          businessId: business.id,
          active: true,
          services: { some: { serviceId: service.id } },
          ...(input.professionalId ? { id: input.professionalId } : {}),
        },
        orderBy: [{ name: 'asc' }, { id: 'asc' }],
      })
      if (professionals.length === 0) {
        throw new AppError(404, 'NOT_FOUND', 'Nenhum profissional disponível para este serviço')
      }

      await lockProfessionals(tx, professionals.map((professional) => professional.id))

      let chosen: (typeof professionals)[number] | null = null
      let slot: { endsAt: Date; blockedUntil: Date } | null = null
      let failure = 'Nenhum profissional livre neste horário'
      for (const professional of professionals) {
        try {
          const decision = await assertProfessionalSlot(tx, {
            business,
            service,
            professionalId: professional.id,
            startsAt: input.startsAt,
          })
          chosen = professional
          slot = decision
          break
        } catch (error) {
          if (error instanceof AppError && error.code === 'SLOT_UNAVAILABLE') {
            failure = error.message
            if (input.professionalId) break
            continue
          }
          throw error
        }
      }
      if (!chosen || !slot) throw new AppError(409, 'SLOT_UNAVAILABLE', failure)

      const customer = await resolveCustomer(tx, input)
      const status: PrismaStatus =
        input.actor === 'PUBLIC' ? (business.autoConfirm ? 'CONFIRMED' : 'PENDING') : (input.status ?? 'CONFIRMED')

      const appointment = await tx.appointment.create({
        data: {
          businessId: business.id,
          professionalId: chosen.id,
          serviceId: service.id,
          customerId: customer.id,
          startsAt: input.startsAt,
          endsAt: slot.endsAt,
          blockedUntil: slot.blockedUntil,
          status,
          notes: input.notes,
          priceSnapshot: service.price,
          idempotencyKey: input.idempotencyKey,
        },
        include: appointmentInclude,
      })

      const accessToken = randomToken()
      await tx.appointmentAccessToken.create({
        data: {
          appointmentId: appointment.id,
          tokenHash: hashToken(accessToken),
          expiresAt: DateTime.utc().plus({ days: 180 }).toJSDate(),
        },
      })
      await writeAudit(tx, {
        businessId: business.id,
        actorId: input.actorUserId,
        action: 'APPOINTMENT_CREATED',
        entityType: 'Appointment',
        entityId: appointment.id,
        metadata: { status, professionalId: chosen.id },
      })
      return { appointment, accessToken, reused: false }
    })
  } catch (error) {
    if (
      input.idempotencyKey &&
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      const existing = await findIdempotent(input.businessId, input.idempotencyKey)
      if (existing) return { appointment: existing, accessToken: null, reused: true }
    }
    if (isSlotConflict(error)) {
      throw new AppError(409, 'SLOT_UNAVAILABLE', 'Esse horário acabou de ser ocupado. Escolha outro.')
    }
    throw error
  }
}

function scope(actor: ActorRole, actorUserId: string | undefined, professionalId: string | null) {
  if (actor === 'PROFESSIONAL') return { professionalId: professionalId ?? '__none__' }
  if (actor === 'CUSTOMER') return { customer: { userId: actorUserId ?? '__none__' } }
  return {}
}

export async function updateAppointment(input: {
  id: string
  businessId: string
  actor: ActorRole
  actorUserId?: string
  professionalScopeId: string | null
  startsAt?: Date
  status?: AppointmentStatus
  notes?: string | null
  cancelReason?: string
}) {
  try {
    return await prisma.$transaction(async (tx) => {
      const current = await tx.appointment.findFirst({
        where: {
          id: input.id,
          businessId: input.businessId,
          ...scope(input.actor, input.actorUserId, input.professionalScopeId),
        },
        include: { service: true },
      })
      if (!current) throw new AppError(404, 'NOT_FOUND', 'Agendamento não encontrado')

      if (input.actor === 'CUSTOMER' && input.status && input.status !== 'CANCELLED') {
        throw new AppError(403, 'FORBIDDEN', 'Clientes não alteram o status do atendimento')
      }

      const business = await tx.business.findUniqueOrThrow({ where: { id: input.businessId } })
      let startsAt = current.startsAt
      let endsAt = current.endsAt
      let blockedUntil = current.blockedUntil
      let status = current.status

      if (input.startsAt && input.startsAt.getTime() !== current.startsAt.getTime()) {
        if (status === 'CANCELLED' || status === 'COMPLETED' || status === 'NO_SHOW') {
          throw new AppError(409, 'INVALID_TRANSITION', 'Este agendamento não pode ser reagendado')
        }
        const window = cancellationDecision({
          role: input.actor,
          startsAt: current.startsAt,
          now: new Date(),
          cancelMinHours: business.cancelMinHours,
        })
        if (!window.ok) throw new AppError(422, 'RESCHEDULE_WINDOW', window.message)
        await lockProfessionals(tx, [current.professionalId])
        const slot = await assertProfessionalSlot(tx, {
          business,
          service: current.service,
          professionalId: current.professionalId,
          startsAt: input.startsAt,
          excludeAppointmentId: current.id,
        })
        startsAt = input.startsAt
        endsAt = slot.endsAt
        blockedUntil = slot.blockedUntil
      }

      if (input.status && input.status !== current.status) {
        if (!canTransition(current.status, input.status)) {
          throw new AppError(409, 'INVALID_TRANSITION', 'Transição de status não permitida')
        }
        if (input.status === 'CANCELLED') {
          const window = cancellationDecision({
            role: input.actor,
            startsAt: current.startsAt,
            now: new Date(),
            cancelMinHours: business.cancelMinHours,
          })
          if (!window.ok) throw new AppError(422, 'CANCEL_WINDOW', window.message)
        }
        status = input.status
      }

      const updated = await tx.appointment.update({
        where: { id: current.id },
        data: {
          startsAt,
          endsAt,
          blockedUntil,
          status,
          notes: input.notes === undefined ? current.notes : input.notes,
          cancelReason:
            status === 'CANCELLED' ? (input.cancelReason ?? current.cancelReason) : current.cancelReason,
        },
        include: appointmentInclude,
      })
      await writeAudit(tx, {
        businessId: input.businessId,
        actorId: input.actorUserId,
        action: 'APPOINTMENT_UPDATED',
        entityType: 'Appointment',
        entityId: updated.id,
        metadata: { status },
      })
      return updated
    })
  } catch (error) {
    if (isSlotConflict(error)) {
      throw new AppError(409, 'SLOT_UNAVAILABLE', 'Esse horário acabou de ser ocupado. Escolha outro.')
    }
    throw error
  }
}

export async function getAppointmentForToken(id: string, token: string) {
  const record = await prisma.appointmentAccessToken.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { appointment: { include: appointmentInclude } },
  })
  if (!record || record.expiresAt < new Date() || record.appointmentId !== id) {
    throw new AppError(404, 'NOT_FOUND', 'Agendamento não encontrado')
  }
  return record.appointment
}
