import { Router } from 'express'
import type { Mailer } from '../../lib/mailer.js'
import { asyncHandler } from '../../lib/async-handler.js'
import { getValidated, validate } from '../../middleware/validate.js'
import { requireAuth } from '../../middleware/auth.js'
import {
  forgotSchema,
  loginSchema,
  registerCustomerSchema,
  registerSchema,
  resetSchema,
} from '../common/schemas.js'
import {
  REFRESH_COOKIE,
  login,
  logout,
  loadProfile,
  refreshCookieOptions,
  registerBusiness,
  registerCustomer,
  requestPasswordReset,
  resetPassword,
  rotateRefreshToken,
} from './auth.service.js'

export function createAuthRouter(mailer: Mailer) {
  const router = Router()

  router.post(
    '/register',
    validate(registerSchema),
    asyncHandler(async (req, res) => {
      const { body } = getValidated<typeof registerSchema._output>(req)
      const session = await registerBusiness({ ...body, userAgent: req.get('user-agent') })
      res.cookie(REFRESH_COOKIE, session.refreshToken, refreshCookieOptions())
      res.status(201).json({ accessToken: session.accessToken, user: session.user })
    }),
  )

  router.post(
    '/register-customer',
    validate(registerCustomerSchema),
    asyncHandler(async (req, res) => {
      const { body } = getValidated<typeof registerCustomerSchema._output>(req)
      const session = await registerCustomer({ ...body, userAgent: req.get('user-agent') })
      res.cookie(REFRESH_COOKIE, session.refreshToken, refreshCookieOptions())
      res.status(201).json({ accessToken: session.accessToken, user: session.user })
    }),
  )

  router.post(
    '/login',
    validate(loginSchema),
    asyncHandler(async (req, res) => {
      const { body } = getValidated<typeof loginSchema._output>(req)
      const session = await login({ ...body, userAgent: req.get('user-agent') })
      res.cookie(REFRESH_COOKIE, session.refreshToken, refreshCookieOptions())
      res.json({ accessToken: session.accessToken, user: session.user })
    }),
  )

  router.post(
    '/refresh',
    asyncHandler(async (req, res) => {
      const session = await rotateRefreshToken(req.cookies?.[REFRESH_COOKIE], req.get('user-agent'))
      res.cookie(REFRESH_COOKIE, session.refreshToken, refreshCookieOptions())
      res.json({ accessToken: session.accessToken, user: session.user })
    }),
  )

  router.post(
    '/logout',
    asyncHandler(async (req, res) => {
      await logout(req.cookies?.[REFRESH_COOKIE])
      const options = refreshCookieOptions()
      res.clearCookie(REFRESH_COOKIE, {
        httpOnly: options.httpOnly,
        secure: options.secure,
        sameSite: options.sameSite,
        path: options.path,
      })
      res.status(204).send()
    }),
  )

  router.get(
    '/me',
    asyncHandler(requireAuth),
    asyncHandler(async (req, res) => {
      res.json({ user: await loadProfile(req.user!.id) })
    }),
  )

  router.post(
    '/forgot-password',
    validate(forgotSchema),
    asyncHandler(async (req, res) => {
      const { body } = getValidated<typeof forgotSchema._output>(req)
      const result = await requestPasswordReset(body.email, mailer)
      res.json(result)
    }),
  )

  router.post(
    '/reset-password',
    validate(resetSchema),
    asyncHandler(async (req, res) => {
      const { body } = getValidated<typeof resetSchema._output>(req)
      res.json(await resetPassword(body.token, body.password))
    }),
  )

  return router
}
