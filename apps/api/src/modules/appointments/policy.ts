import type { AppointmentStatus, Role } from '@mp-agenda/shared'
import { canTransition } from '@mp-agenda/shared'
import { DateTime } from 'luxon'

export type ActorRole = Role | 'PUBLIC'

export function cancellationDecision(input: {
  role: ActorRole
  startsAt: Date
  now: Date
  cancelMinHours: number
}): { ok: true } | { ok: false; message: string } {
  if (input.role === 'ADMIN' || input.role === 'PROFESSIONAL') return { ok: true }
  const deadline = DateTime.fromJSDate(input.startsAt, { zone: 'utc' }).minus({
    hours: input.cancelMinHours,
  })
  if (DateTime.fromJSDate(input.now, { zone: 'utc' }) <= deadline) return { ok: true }
  return {
    ok: false,
    message: `Cancelamento e reagendamento ficam disponíveis até ${input.cancelMinHours} hora(s) antes do atendimento.`,
  }
}

export function assertTransition(from: AppointmentStatus, to: AppointmentStatus) {
  if (from === to) return
  if (!canTransition(from, to)) {
    throw new Error(`INVALID:${from}:${to}`)
  }
}
