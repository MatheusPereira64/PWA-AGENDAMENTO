import nodemailer from 'nodemailer'
import { env } from '../config/env.js'
import { AppError } from './errors.js'

export type MailMessage = {
  to: string
  subject: string
  text: string
}

export interface Mailer {
  isConfigured(): boolean
  send(message: MailMessage): Promise<void>
}

export function createMailer(): Mailer {
  const configured = Boolean(env.SMTP_HOST && env.SMTP_FROM)
  if (!configured) {
    return {
      isConfigured: () => false,
      async send() {
        throw new AppError(
          503,
          'EMAIL_NOT_CONFIGURED',
          'O envio de e-mail não está configurado. Defina SMTP_HOST e SMTP_FROM.',
        )
      },
    }
  }

  const port = env.SMTP_PORT ?? 587
  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  })

  return {
    isConfigured: () => true,
    async send(message) {
      await transport.sendMail({
        from: env.SMTP_FROM,
        to: message.to,
        subject: message.subject,
        text: message.text,
      })
    },
  }
}

export function calendarIntegrationStatus() {
  const configured = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET)
  return {
    provider: 'google-calendar' as const,
    configured,
    message: configured
      ? 'Credenciais do Google encontradas. A criação de eventos não está ativa nesta versão; nenhum evento foi simulado.'
      : 'Integração desligada. Defina GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET e GOOGLE_REDIRECT_URI para prepará-la. O agendamento funciona sem isso.',
  }
}
