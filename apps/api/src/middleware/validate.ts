import type { NextFunction, Request, Response } from 'express'
import { ZodError, type ZodType } from 'zod'
import { AppError } from '../lib/errors.js'

export type ValidatedRequest<T> = Request & { validated: T }

export function validate<T>(schema: ZodType<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    })
    if (!parsed.success) {
      const details = parsed.error instanceof ZodError ? parsed.error.flatten() : parsed.error
      next(new AppError(400, 'VALIDATION_ERROR', 'Dados inválidos', details))
      return
    }
    ;(req as ValidatedRequest<T>).validated = parsed.data
    next()
  }
}

export function getValidated<T>(req: Request): T {
  return (req as ValidatedRequest<T>).validated
}
