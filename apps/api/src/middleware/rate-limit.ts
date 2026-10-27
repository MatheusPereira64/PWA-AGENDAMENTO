import rateLimit from 'express-rate-limit'
import { env } from '../config/env.js'

const skipInTest = () => env.NODE_ENV === 'test'

function limited(max: number, windowMs: number, message: string) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    skip: skipInTest,
    handler: (_req, res) => {
      res.status(429).json({ code: 'RATE_LIMITED', message })
    },
  })
}

export const apiLimiter = limited(300, 15 * 60 * 1000, 'Muitas requisições. Aguarde alguns minutos.')

export const authLimiter = limited(
  10,
  15 * 60 * 1000,
  'Muitas tentativas de autenticação. Aguarde alguns minutos.',
)
