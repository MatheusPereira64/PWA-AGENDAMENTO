import type { Prisma, PrismaClient } from '@prisma/client'

type Database = Prisma.TransactionClient | PrismaClient

export function writeAudit(
  db: Database,
  input: {
    businessId: string
    actorId?: string | null
    action: string
    entityType: string
    entityId: string
    metadata?: Prisma.InputJsonValue
  },
) {
  return db.auditLog.create({
    data: {
      businessId: input.businessId,
      actorId: input.actorId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: input.metadata,
    },
  })
}
