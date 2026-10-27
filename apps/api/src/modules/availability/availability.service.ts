import { OCCUPYING_STATUSES } from '@mp-agenda/shared'
import { DateTime } from 'luxon'
import { AppError } from '../../lib/errors.js'
import { prisma } from '../../lib/prisma.js'
import { buildSlots, mergeSlots, resolveWorkingHours, type WorkingHours } from './slots.js'

const occupying = [...OCCUPYING_STATUSES]

export async function getAvailability(input: {
  businessId: string
  serviceId: string
  date: string
  professionalId?: string
}) {
  const business = await prisma.business.findUnique({ where: { id: input.businessId } })
  if (!business) throw new AppError(404, 'NOT_FOUND', 'Negócio não encontrado')

  const service = await prisma.service.findFirst({
    where: { id: input.serviceId, businessId: business.id, active: true },
  })
  if (!service) throw new AppError(404, 'NOT_FOUND', 'Serviço não encontrado')

  const day = DateTime.fromISO(input.date, { zone: business.timezone })
  if (!day.isValid) throw new AppError(400, 'VALIDATION_ERROR', 'Data inválida')

  const professionals = await prisma.professional.findMany({
    where: {
      businessId: business.id,
      active: true,
      services: { some: { serviceId: service.id } },
      ...(input.professionalId ? { id: input.professionalId } : {}),
    },
    include: { workingHours: true },
    orderBy: { name: 'asc' },
  })

  if (input.professionalId && professionals.length === 0) {
    throw new AppError(404, 'NOT_FOUND', 'Profissional não disponível para este serviço')
  }

  if (professionals.length === 0) {
    return { date: input.date, timezone: business.timezone, serviceId: service.id, slots: [] }
  }

  const dayStart = day.startOf('day').toUTC().toJSDate()
  const dayEnd = day.endOf('day').plus({ hours: 8 }).toUTC().toJSDate()
  const ids = professionals.map((professional) => professional.id)

  const [appointments, timeOff, businessHours] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        professionalId: { in: ids },
        status: { in: occupying },
        startsAt: { lt: dayEnd },
        blockedUntil: { gt: dayStart },
      },
      select: { professionalId: true, startsAt: true, blockedUntil: true },
    }),
    prisma.timeOff.findMany({
      where: {
        businessId: business.id,
        startsAt: { lt: dayEnd },
        endsAt: { gt: dayStart },
        OR: [{ professionalId: null }, { professionalId: { in: ids } }],
      },
    }),
    prisma.businessWorkingHours.findUnique({
      where: { businessId_weekday: { businessId: business.id, weekday: day.weekday } },
    }),
  ])

  const groups = professionals.map((professional) => {
    const hours = resolveWorkingHours(
      professional.workingHours,
      businessHours,
      day.weekday,
    )
    return {
      professionalId: professional.id,
      slots: buildSlots({
        timezone: business.timezone,
        date: input.date,
        durationMinutes: service.durationMinutes,
        bufferMinutes: service.bufferMinutes,
        slotIntervalMinutes: business.slotIntervalMinutes,
        minAdvanceMinutes: business.minAdvanceMinutes,
        maxAdvanceDays: business.maxAdvanceDays,
        now: new Date(),
        workingHours: hours,
        busy: appointments.filter((item) => item.professionalId === professional.id),
        timeOff: timeOff
          .filter((item) => item.professionalId === null || item.professionalId === professional.id)
          .map((item) => ({ startsAt: item.startsAt, endsAt: item.endsAt })),
      }),
    }
  })

  return {
    date: input.date,
    timezone: business.timezone,
    serviceId: service.id,
    slots: mergeSlots(groups),
  }
}

export type HoursSource = WorkingHours & { weekday: number }
