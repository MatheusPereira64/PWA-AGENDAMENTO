import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import { createApp } from '../src/app.js'
import { prisma } from '../src/lib/prisma.js'
import { resetDatabase } from './helpers.js'

const app = createApp()

beforeEach(async () => {
  await resetDatabase()
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe('autenticação', () => {
  it('cadastra, consulta a sessão e recusa senha inválida', async () => {
    const agent = request.agent(app)
    const created = await agent.post('/api/auth/register').send({
      name: 'Ana Admin',
      email: 'ana@example.com',
      password: 'Senha#123',
      businessName: 'Salao Ana',
      slug: 'salao-ana',
      phone: '11987654321',
    })
    expect(created.status).toBe(201)
    expect(created.body.accessToken).toBeTruthy()
    expect(created.body.user.memberships[0].role).toBe('ADMIN')
    expect(created.body.user.passwordHash).toBeUndefined()

    const me = await agent
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${created.body.accessToken}`)
    expect(me.status).toBe(200)
    expect(me.body.user.email).toBe('ana@example.com')

    const invalid = await request(app).post('/api/auth/login').send({
      email: 'ana@example.com',
      password: 'errada123',
    })
    expect(invalid.status).toBe(401)

    const logged = await request(app).post('/api/auth/login').send({
      email: 'ana@example.com',
      password: 'Senha#123',
    })
    expect(logged.status).toBe(200)

    const refreshed = await agent.post('/api/auth/refresh')
    expect(refreshed.status).toBe(200)
    expect(refreshed.body.accessToken).toBeTruthy()

    const logout = await agent.post('/api/auth/logout')
    expect(logout.status).toBe(204)
    const again = await agent.post('/api/auth/refresh')
    expect(again.status).toBe(401)
  })

  it('não finge o envio de e-mail quando o SMTP não está configurado', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Ana Admin',
      email: 'ana@example.com',
      password: 'Senha#123',
      businessName: 'Salao Ana',
      slug: 'salao-ana',
    })
    const response = await request(app).post('/api/auth/forgot-password').send({
      email: 'ana@example.com',
    })
    expect(response.status).toBe(503)
    expect(response.body.code).toBe('EMAIL_NOT_CONFIGURED')
  })

  it('rejeita dados inválidos', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'A',
      email: 'nao-e-email',
      password: '123',
      businessName: 'X',
      slug: 'Inválido',
    })
    expect(response.status).toBe(400)
    expect(response.body.code).toBe('VALIDATION_ERROR')
  })
})
