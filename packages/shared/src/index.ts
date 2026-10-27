import { z } from 'zod'

export const ROLES = ['ADMIN', 'PROFESSIONAL', 'CUSTOMER'] as const
export type Role = (typeof ROLES)[number]

export const APPOINTMENT_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
] as const
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number]

export const OCCUPYING_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'COMPLETED',
  'NO_SHOW',
] as const satisfies readonly AppointmentStatus[]

export const STATUS_TRANSITIONS: Record<AppointmentStatus, readonly AppointmentStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['COMPLETED', 'NO_SHOW', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
}

export function canTransition(from: AppointmentStatus, to: AppointmentStatus): boolean {
  return STATUS_TRANSITIONS[from].includes(to)
}

export const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Horário inválido')

export const slugSchema = z
  .string()
  .trim()
  .min(3)
  .max(48)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use letras minúsculas, números e hífens')

export const phoneSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/\D/g, ''))
  .refine((value) => value.length >= 10 && value.length <= 11, 'Telefone inválido')

export const passwordSchema = z
  .string()
  .min(8, 'A senha precisa ter ao menos 8 caracteres')
  .regex(/[A-Za-z]/, 'A senha precisa ter ao menos uma letra')
  .regex(/\d/, 'A senha precisa ter ao menos um número')

export const emailSchema = z.string().trim().email('E-mail inválido').max(160)

export function statusLabel(status: AppointmentStatus): string {
  const labels: Record<AppointmentStatus, string> = {
    PENDING: 'Pendente',
    CONFIRMED: 'Confirmado',
    COMPLETED: 'Concluído',
    CANCELLED: 'Cancelado',
    NO_SHOW: 'Não compareceu',
  }
  return labels[status]
}

export function roleLabel(role: Role): string {
  const labels: Record<Role, string> = {
    ADMIN: 'Administrador',
    PROFESSIONAL: 'Profissional',
    CUSTOMER: 'Cliente',
  }
  return labels[role]
}
