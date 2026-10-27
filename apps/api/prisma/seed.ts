import 'dotenv/config'
import { hash } from '@node-rs/argon2'
import { PrismaClient, type AppointmentStatus } from '@prisma/client'
import { DateTime } from 'luxon'

const prisma = new PrismaClient()
const zone = 'America/Sao_Paulo'

function at(dayOffset: number, hour: number, minute = 0) {
  return DateTime.now()
    .setZone(zone)
    .startOf('day')
    .plus({ days: dayOffset, hours: hour, minutes: minute })
    .toUTC()
    .toJSDate()
}

async function main() {
  const password = {
    admin: await hash('Aurora#2026', { memoryCost: 19456, timeCost: 2, parallelism: 1 }),
    marina: await hash('Marina#2026', { memoryCost: 19456, timeCost: 2, parallelism: 1 }),
    cliente: await hash('Cliente#2026', { memoryCost: 19456, timeCost: 2, parallelism: 1 }),
  }

  const free = await prisma.plan.upsert({
    where: { code: 'free' },
    update: { name: 'Gratuito', maxProfessionals: 5, maxAppointmentsPerMonth: 300 },
    create: { code: 'free', name: 'Gratuito', maxProfessionals: 5, maxAppointmentsPerMonth: 300 },
  })
  await prisma.plan.upsert({
    where: { code: 'studio' },
    update: { name: 'Studio', maxProfessionals: 20, maxAppointmentsPerMonth: 2000 },
    create: { code: 'studio', name: 'Studio', maxProfessionals: 20, maxAppointmentsPerMonth: 2000 },
  })

  const [admin, marinaUser, clienteUser] = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@studioaurora.example.com' },
      update: { name: 'Helena Admin', passwordHash: password.admin },
      create: { name: 'Helena Admin', email: 'admin@studioaurora.example.com', passwordHash: password.admin },
    }),
    prisma.user.upsert({
      where: { email: 'marina@studioaurora.example.com' },
      update: { name: 'Marina Costa', passwordHash: password.marina },
      create: { name: 'Marina Costa', email: 'marina@studioaurora.example.com', passwordHash: password.marina },
    }),
    prisma.user.upsert({
      where: { email: 'cliente@studioaurora.example.com' },
      update: { name: 'Carla Dias', passwordHash: password.cliente },
      create: { name: 'Carla Dias', email: 'cliente@studioaurora.example.com', passwordHash: password.cliente },
    }),
  ])

  const existing = await prisma.business.findUnique({ where: { slug: 'studio-aurora' } })
  if (existing) {
    await prisma.appointment.deleteMany({ where: { businessId: existing.id } })
    await prisma.timeOff.deleteMany({ where: { businessId: existing.id } })
    await prisma.auditLog.deleteMany({ where: { businessId: existing.id } })
    await prisma.professional.deleteMany({ where: { businessId: existing.id } })
    await prisma.service.deleteMany({ where: { businessId: existing.id } })
    await prisma.customer.deleteMany({ where: { businessId: existing.id } })
    await prisma.businessMembership.deleteMany({ where: { businessId: existing.id } })
    await prisma.business.delete({ where: { id: existing.id } })
  }

  const business = await prisma.business.create({
    data: {
      name: 'Studio Aurora',
      slug: 'studio-aurora',
      phone: '11987654321',
      email: 'contato@studioaurora.example.com',
      address: 'Rua das Acácias, 120 — São Paulo',
      description: 'Salão de demonstração da MP Agenda. Os dados são fictícios.',
      timezone: zone,
      primaryColor: '#0E7C66',
      accentColor: '#C4A574',
      isDemo: true,
      planId: free.id,
      minAdvanceMinutes: 60,
      maxAdvanceDays: 60,
      cancelMinHours: 2,
      slotIntervalMinutes: 30,
      bufferMinutes: 0,
      autoConfirm: true,
      workingHours: {
        create: [1, 2, 3, 4, 5, 6].map((weekday) => ({
          weekday,
          startTime: '09:00',
          endTime: weekday === 6 ? '14:00' : '18:00',
        })),
      },
    },
  })

  const [corte, barba, coloracao, manicure] = await Promise.all([
    prisma.service.create({
      data: {
        businessId: business.id,
        name: 'Corte',
        description: 'Corte e finalização',
        durationMinutes: 60,
        price: '120.00',
        bufferMinutes: 10,
      },
    }),
    prisma.service.create({
      data: {
        businessId: business.id,
        name: 'Barba',
        description: 'Barba tradicional',
        durationMinutes: 30,
        price: '45.00',
        bufferMinutes: 5,
      },
    }),
    prisma.service.create({
      data: {
        businessId: business.id,
        name: 'Coloração',
        description: 'Coloração completa',
        durationMinutes: 90,
        price: '220.00',
        bufferMinutes: 15,
      },
    }),
    prisma.service.create({
      data: {
        businessId: business.id,
        name: 'Manicure',
        description: 'Cuidado das unhas',
        durationMinutes: 45,
        price: '55.00',
        bufferMinutes: 10,
      },
    }),
  ])

  const marina = await prisma.professional.create({
    data: {
      businessId: business.id,
      userId: marinaUser.id,
      name: 'Marina Costa',
      email: marinaUser.email,
      phone: '11911111111',
      bio: 'Cortes e coloração',
      color: '#0E7C66',
      services: { create: [{ serviceId: corte.id }, { serviceId: coloracao.id }] },
      workingHours: {
        create: [1, 2, 3, 4, 5].map((weekday) => ({
          weekday,
          startTime: '09:00',
          endTime: '18:00',
          breakStart: '12:00',
          breakEnd: '13:00',
        })),
      },
    },
  })
  const rafael = await prisma.professional.create({
    data: {
      businessId: business.id,
      name: 'Rafael Lima',
      email: 'rafael@studioaurora.example.com',
      phone: '11922222222',
      bio: 'Cortes e barba',
      color: '#1F4E46',
      services: { create: [{ serviceId: corte.id }, { serviceId: barba.id }] },
      workingHours: {
        create: [2, 3, 4, 5, 6].map((weekday) => ({
          weekday,
          startTime: '09:00',
          endTime: weekday === 6 ? '14:00' : '18:00',
          breakStart: weekday === 6 ? null : '12:00',
          breakEnd: weekday === 6 ? null : '13:00',
        })),
      },
    },
  })
  const helena = await prisma.professional.create({
    data: {
      businessId: business.id,
      name: 'Helena Dias',
      phone: '11933333333',
      bio: 'Manicure',
      color: '#C4A574',
      services: { create: [{ serviceId: manicure.id }, { serviceId: corte.id }] },
      workingHours: {
        create: [1, 2, 3, 4, 5, 6].map((weekday) => ({
          weekday,
          startTime: '09:00',
          endTime: weekday === 6 ? '14:00' : '18:00',
          breakStart: weekday === 6 ? null : '12:00',
          breakEnd: weekday === 6 ? null : '13:00',
        })),
      },
    },
  })

  await prisma.businessMembership.createMany({
    data: [
      { userId: admin.id, businessId: business.id, role: 'ADMIN' },
      { userId: marinaUser.id, businessId: business.id, role: 'PROFESSIONAL', professionalId: marina.id },
      { userId: clienteUser.id, businessId: business.id, role: 'CUSTOMER' },
    ],
  })

  const [ana, bruno, carla] = await Promise.all([
    prisma.customer.create({
      data: { businessId: business.id, name: 'Ana Souza', phone: '11940000001', email: 'ana@example.com' },
    }),
    prisma.customer.create({
      data: { businessId: business.id, name: 'Bruno Lima', phone: '11940000002', email: 'bruno@example.com' },
    }),
    prisma.customer.create({
      data: {
        businessId: business.id,
        userId: clienteUser.id,
        name: 'Carla Dias',
        phone: '11940000003',
        email: clienteUser.email,
      },
    }),
  ])

  const rows: {
    professionalId: string
    serviceId: string
    customerId: string
    day: number
    hour: number
    duration: number
    buffer: number
    price: string
    status: AppointmentStatus
  }[] = [
    { professionalId: marina.id, serviceId: corte.id, customerId: ana.id, day: -1, hour: 10, duration: 60, buffer: 10, price: '120.00', status: 'COMPLETED' },
    { professionalId: rafael.id, serviceId: barba.id, customerId: bruno.id, day: 0, hour: 11, duration: 30, buffer: 5, price: '45.00', status: 'CONFIRMED' },
    { professionalId: marina.id, serviceId: coloracao.id, customerId: carla.id, day: 0, hour: 15, duration: 90, buffer: 15, price: '220.00', status: 'PENDING' },
    { professionalId: helena.id, serviceId: manicure.id, customerId: ana.id, day: 0, hour: 16, duration: 45, buffer: 10, price: '55.00', status: 'CANCELLED' },
    { professionalId: rafael.id, serviceId: corte.id, customerId: carla.id, day: 1, hour: 10, duration: 60, buffer: 10, price: '120.00', status: 'CONFIRMED' },
  ]

  for (const row of rows) {
    const startsAt = at(row.day, row.hour)
    const endsAt = DateTime.fromJSDate(startsAt).plus({ minutes: row.duration }).toJSDate()
    const blockedUntil = DateTime.fromJSDate(endsAt).plus({ minutes: row.buffer }).toJSDate()
    await prisma.appointment.create({
      data: {
        businessId: business.id,
        professionalId: row.professionalId,
        serviceId: row.serviceId,
        customerId: row.customerId,
        startsAt,
        endsAt,
        blockedUntil,
        status: row.status,
        priceSnapshot: row.price,
      },
    })
  }

  const tomorrowAfternoon = at(1, 14)
  await prisma.timeOff.create({
    data: {
      businessId: business.id,
      professionalId: helena.id,
      startsAt: tomorrowAfternoon,
      endsAt: DateTime.fromJSDate(tomorrowAfternoon).plus({ hours: 4 }).toJSDate(),
      reason: 'Folga de demonstração',
    },
  })

  console.log('Seed do Studio Aurora concluído.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
