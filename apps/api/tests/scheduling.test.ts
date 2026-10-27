import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import { createApp } from '../src/app.js'
import { prisma } from '../src/lib/prisma.js'
import { hashPassword } from '../src/lib/password.js'
import { signAccessToken } from '../src/lib/tokens.js'
import { createSalon, futureMorning, resetDatabase } from './helpers.js'

const app = createApp()

beforeEach(async () => {
  await resetDatabase()
})

afterAll(async () => {
  await prisma.$disconnect()
})

async function authHeader(userId: string) {
  return { Authorization: `Bearer ${await signAccessToken(userId)}` }
}

describe('agendamentos', () => {
  it('cria, esconde o horário ocupado e impede conflito simultâneo', async () => {
    const salon = await createSalon()
    const when = futureMorning()
    const payload = {
      serviceId: salon.service.id,
      professionalId: salon.professional.id,
      startsAt: when.toUTC().toISO(),
      customer: { name: 'Ana Souza', phone: '11988887777', email: 'ana.souza@example.com' },
    }

    const [first, second] = await Promise.all([
      request(app).post(`/api/businesses/${salon.business.slug}/appointments`).send(payload),
      request(app).post(`/api/businesses/${salon.business.slug}/appointments`).send({
        ...payload,
        customer: { name: 'Bruno Lima', phone: '11988886666' },
      }),
    ])
    const statuses = [first.status, second.status].sort()
    expect(statuses).toEqual([201, 409])

    const availability = await request(app).get(
      `/api/businesses/${salon.business.slug}/availability?serviceId=${salon.service.id}&date=${when.toISODate()}&professionalId=${salon.professional.id}`,
    )
    expect(availability.status).toBe(200)
    expect(availability.body.slots.map((slot: { label: string }) => slot.label)).not.toContain('10:00')

    const profile = await request(app).get(`/api/businesses/${salon.business.slug}`)
    expect(profile.status).toBe(200)
    expect(JSON.stringify(profile.body)).not.toContain('11988887777')
    expect(JSON.stringify(profile.body)).not.toContain('ana.souza@example.com')
  })

  it('isola negócios e restringe o profissional à própria agenda', async () => {
    const first = await createSalon('Um', 'negocio-um')
    const second = await createSalon('Dois', 'negocio-dois')
    const owner = await prisma.user.create({
      data: { name: 'Dona', email: 'dona@example.com', passwordHash: await hashPassword('Senha#123') },
    })
    const professionalUser = await prisma.user.create({
      data: { name: 'Marina', email: 'marina@example.com', passwordHash: await hashPassword('Senha#123') },
    })
    await prisma.businessMembership.create({
      data: { userId: owner.id, businessId: first.business.id, role: 'ADMIN' },
    })
    await prisma.professional.update({
      where: { id: first.professional.id },
      data: { userId: professionalUser.id },
    })
    await prisma.businessMembership.create({
      data: {
        userId: professionalUser.id,
        businessId: first.business.id,
        role: 'PROFESSIONAL',
        professionalId: first.professional.id,
      },
    })

    const when = futureMorning(4)
    const created = await request(app)
      .post('/api/appointments')
      .set(await authHeader(owner.id))
      .set('X-Business-Id', first.business.id)
      .send({
        serviceId: first.service.id,
        professionalId: first.other.id,
        startsAt: when.toUTC().toISO(),
        customer: { name: 'Cliente Um', phone: '11977776666' },
      })
    expect(created.status).toBe(201)

    const otherBusiness = await request(app)
      .get('/api/appointments')
      .set(await authHeader(owner.id))
      .set('X-Business-Id', second.business.id)
    expect(otherBusiness.status).toBe(403)

    const ownList = await request(app)
      .get('/api/appointments')
      .set(await authHeader(professionalUser.id))
      .set('X-Business-Id', first.business.id)
    expect(ownList.status).toBe(200)
    expect(ownList.body.data).toHaveLength(0)

    const forbidden = await request(app)
      .post('/api/services')
      .set(await authHeader(professionalUser.id))
      .set('X-Business-Id', first.business.id)
      .send({ name: 'Novo', durationMinutes: 30, price: '40.00' })
    expect(forbidden.status).toBe(403)

    const detail = await request(app)
      .get(`/api/appointments/${created.body.appointment.id}`)
      .set(await authHeader(professionalUser.id))
      .set('X-Business-Id', first.business.id)
    expect(detail.status).toBe(404)
  })

  it('aplica a janela de cancelamento para o cliente e permite o administrador', async () => {
    const salon = await createSalon()
    const soon = futureMorning(2).set({ hour: 15 })
    const created = await request(app).post(`/api/businesses/${salon.business.slug}/appointments`).send({
      serviceId: salon.service.id,
      professionalId: salon.professional.id,
      startsAt: soon.toUTC().toISO(),
      customer: { name: 'Carla', phone: '11966665555' },
    })
    expect(created.status).toBe(201)
    const token = created.body.accessToken as string
    const id = created.body.appointment.id as string

    await prisma.appointment.update({
      where: { id },
      data: { startsAt: new Date(Date.now() + 30 * 60 * 1000) },
    })

    const late = await request(app).post(`/api/public/appointments/${id}/cancel`).send({ token })
    expect(late.status).toBe(422)

    const admin = await prisma.user.create({
      data: { name: 'Admin', email: 'admin@example.com', passwordHash: await hashPassword('Senha#123') },
    })
    await prisma.businessMembership.create({
      data: { userId: admin.id, businessId: salon.business.id, role: 'ADMIN' },
    })
    const cancelled = await request(app)
      .post(`/api/appointments/${id}/cancel`)
      .set(await authHeader(admin.id))
      .set('X-Business-Id', salon.business.id)
      .send({ reason: 'Encaixe interno' })
    expect(cancelled.status).toBe(200)
    expect(cancelled.body.appointment.status).toBe('CANCELLED')
  })
})
