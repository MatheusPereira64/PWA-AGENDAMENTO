import { Prisma } from '@prisma/client'
import type { NextFunction, Request, Response } from 'express'
import { AppError, isSlotConflict } from '../lib/errors.js'
import { logger } from '../lib/logger.js'

export function errorHandler(error: unknown, req: Request, res: Response, _next: NextFunction) {
  if (error instanceof AppError) {
    res.status(error.status).json({
      code: error.code,
      message: error.message,
      details: error.details,
    })
    return
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      res.status(409).json({ code: 'CONFLICT', message: 'Registro duplicado' })
      return
    }
    if (error.code === 'P2025') {
      res.status(404).json({ code: 'NOT_FOUND', message: 'Registro não encontrado' })
      return
    }
  }

  if (isSlotConflict(error)) {
    res.status(409).json({
      code: 'SLOT_UNAVAILABLE',
      message: 'Esse horário acabou de ser ocupado. Escolha outro.',
    })
    return
  }

  logger.error({ err: error, path: req.path }, 'Erro não tratado')
  res.status(500).json({ code: 'INTERNAL', message: 'Erro interno' })
}
