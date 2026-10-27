import type { Request, Response } from 'express'
import { prisma } from '../../lib/prisma.js'

export async function health(_req: Request, res: Response) {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok', database: 'ok', service: 'mp-agenda-api' })
  } catch {
    res.status(503).json({ status: 'degraded', database: 'down', service: 'mp-agenda-api' })
  }
}
