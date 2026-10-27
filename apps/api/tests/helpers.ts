import { prisma } from '../src/lib/prisma.js'
import { DateTime } from 'luxon'

export async function resetDatabase() {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "AuditLog",
      "AppointmentAccessToken",
      "Appointment",
      "TimeOff",
      "ProfessionalWorkingHours",
      "BusinessWorkingHours",
      "ProfessionalService",
      "RefreshToken",
      "PasswordResetToken",
      "BusinessMembership",
      "Customer",
      "Professional",
      "Service",
      "Business",
      "User",
      "Plan"
    RESTART IDENTITY CASCADE
  `)
}

export function futureMorning(daysAhead = 3) {
  let when = DateTime.now()
    .setZone('America/Sao_Paulo')
    .plus({ days: daysAhead })
    .set({ hour: 10, minute: 0, second: 0, millisecond: 0 })
  while (when.weekday > 5) when = when.plus({ days: 1 })
  return when
}

export async function createSalon(name = 'Salao Teste', slug = 'salao-teste') {
  const plan = await prisma.plan.create({
    data: { code: `free-${slug}`, name: 'Gratuito', maxProfessionals: 5, maxAppointmentsPerMonth: 300 },
  })
  const business = await prisma.business.create({
    data: {
      name,
      slug,
      timezone: 'America/Sao_Paulo',
      planId: plan.id,
      minAdvanceMinutes: 60,
      maxAdvanceDays: 60,
      cancelMinHours: 2,
      slotIntervalMinutes: 30,
      autoConfirm: true,
      workingHours: {
        create: [1, 2, 3, 4, 5].map((weekday) => ({
          weekday,
          startTime: '09:00',
          endTime: '18:00',
        })),
      },
    },
  })
  const service = await prisma.service.create({
    data: {
      businessId: business.id,
      name: 'Corte',
      durationMinutes: 60,
      price: '80.00',
      bufferMinutes: 0,
    },
  })
  const professional = await prisma.professional.create({
    data: {
      businessId: business.id,
      name: 'Marina',
      services: { create: [{ serviceId: service.id }] },
      workingHours: {
        create: [1, 2, 3, 4, 5].map((weekday) => ({
          weekday,
          startTime: '09:00',
          endTime: '18:00',
        })),
      },
    },
  })
  const other = await prisma.professional.create({
    data: {
      businessId: business.id,
      name: 'Rafael',
      services: { create: [{ serviceId: service.id }] },
      workingHours: {
        create: [1, 2, 3, 4, 5].map((weekday) => ({
          weekday,
          startTime: '09:00',
          endTime: '18:00',
        })),
      },
    },
  })
  return { plan, business, service, professional, other }
}
