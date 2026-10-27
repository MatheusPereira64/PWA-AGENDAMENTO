import { Router } from 'express'
import { DateTime } from 'luxon'
import { env } from '../../config/env.js'
import { asyncHandler } from '../../lib/async-handler.js'
import { AppError } from '../../lib/errors.js'
import { calendarIntegrationStatus, type Mailer } from '../../lib/mailer.js'
import { prisma } from '../../lib/prisma.js'
import { requireAuth, requireBusiness, requireRoles } from '../../middleware/auth.js'

export function createJobRouter(mailer: Mailer) {
  const router = Router()

  router.post(
    '/reminders',
    asyncHandler(async (req, res) => {
      if (!env.CRON_SECRET || req.header('x-cron-secret') !== env.CRON_SECRET) {
        throw new AppError(401, 'UNAUTHENTICATED', 'Credencial do agendador inválida')
      }
      if (!mailer.isConfigured()) {
        res.status(200).json({
          sent: 0,
          skipped: true,
          reason: 'EMAIL_NOT_CONFIGURED',
          message: 'Nenhum lembrete foi enviado porque o SMTP não está configurado.',
        })
        return
      }
      const until = DateTime.utc().plus({ hours: 24 }).toJSDate()
      const appointments = await prisma.appointment.findMany({
        where: {
          status: 'CONFIRMED',
          reminderSentAt: null,
          startsAt: { gte: new Date(), lte: until },
          customer: { email: { not: null } },
        },
        include: {
          customer: true,
          service: true,
          professional: true,
          business: true,
        },
        take: 100,
      })
      let sent = 0
      for (const appointment of appointments) {
        if (!appointment.customer.email) continue
        const when = DateTime.fromJSDate(appointment.startsAt, { zone: 'utc' })
          .setZone(appointment.business.timezone)
          .toFormat('dd/LL/yyyy HH:mm')
        await mailer.send({
          to: appointment.customer.email,
          subject: `Lembrete: ${appointment.service.name} em ${appointment.business.name}`,
          text: `Olá, ${appointment.customer.name}. Seu horário de ${appointment.service.name} com ${appointment.professional.name} é ${when} (${appointment.business.timezone}).`,
        })
        await prisma.appointment.update({
          where: { id: appointment.id },
          data: { reminderSentAt: new Date() },
        })
        sent += 1
      }
      res.json({ sent, skipped: false })
    }),
  )

  return router
}

export const integrationRouter = Router()
integrationRouter.use(asyncHandler(requireAuth), asyncHandler(requireBusiness), requireRoles('ADMIN'))
integrationRouter.get('/google-calendar', (_req, res) => {
  res.json(calendarIntegrationStatus())
})

export const auditRouter = Router()
auditRouter.use(asyncHandler(requireAuth), asyncHandler(requireBusiness), requireRoles('ADMIN'))
auditRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const rows = await prisma.auditLog.findMany({
      where: { businessId: req.businessId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    res.json({ data: rows })
  }),
)
