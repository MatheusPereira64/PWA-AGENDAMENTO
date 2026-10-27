import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { pinoHttp } from 'pino-http'
import swaggerUi from 'swagger-ui-express'
import { corsOrigins } from './config/env.js'
import { openApi } from './docs/openapi.js'
import { logger } from './lib/logger.js'
import { createMailer, type Mailer } from './lib/mailer.js'
import { asyncHandler } from './lib/async-handler.js'
import { errorHandler } from './middleware/error-handler.js'
import { apiLimiter, authLimiter } from './middleware/rate-limit.js'
import { requireAuth, requireBusiness } from './middleware/auth.js'
import { createAuthRouter } from './modules/auth/auth.routes.js'
import { appointmentRouter, publicAppointmentRouter, publicManageRouter } from './modules/appointments/appointment.routes.js'
import { availabilityRouter, publicBusinessRouter } from './modules/businesses/public.routes.js'
import { businessRouter, scheduleRouter } from './modules/businesses/business.routes.js'
import { customerRouter } from './modules/customers/customer.routes.js'
import { dashboardRouter } from './modules/dashboard/dashboard.routes.js'
import { health } from './modules/health/health.routes.js'
import { auditRouter, createJobRouter, integrationRouter } from './modules/jobs/job.routes.js'
import { professionalRouter } from './modules/professionals/professional.routes.js'
import { serviceRouter } from './modules/services/service.routes.js'

export function createApp(options?: { mailer?: Mailer }) {
  const app = express()
  const mailer = options?.mailer ?? createMailer()
  app.disable('x-powered-by')
  app.set('trust proxy', 1)
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  )
  app.use(cors({ origin: corsOrigins, credentials: true }))
  app.use(express.json({ limit: '1mb' }))
  app.use(cookieParser())
  app.use(
    pinoHttp({
      logger,
      autoLogging: process.env.NODE_ENV !== 'test',
    }),
  )

  app.get('/api/health', asyncHandler(health))
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApi))
  app.get('/docs/openapi.json', (_req, res) => {
    res.json(openApi)
  })

  app.use('/api', apiLimiter)
  app.use('/api/auth', authLimiter, createAuthRouter(mailer))
  app.use('/api/businesses', publicBusinessRouter)
  app.use('/api/businesses', publicAppointmentRouter)
  app.use('/api/public/appointments', publicManageRouter)
  app.use('/api/services', serviceRouter)
  app.use('/api/professionals', professionalRouter)
  app.use('/api/customers', customerRouter)
  app.use('/api/appointments', appointmentRouter)
  app.use('/api/availability', asyncHandler(requireAuth), asyncHandler(requireBusiness), availabilityRouter)
  app.use('/api/dashboard', dashboardRouter)
  app.use('/api/business', businessRouter)
  app.use('/api', scheduleRouter)
  app.use('/api/audit', auditRouter)
  app.use('/api/integrations', integrationRouter)
  app.use('/api/jobs', createJobRouter(mailer))

  app.use((_req, res) => {
    res.status(404).json({ code: 'NOT_FOUND', message: 'Rota não encontrada' })
  })
  app.use(errorHandler)
  return app
}
