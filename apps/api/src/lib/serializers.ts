import { Prisma } from '@prisma/client'
import type { AppointmentStatus, Role } from '@mp-agenda/shared'

export function decimalToString(value: Prisma.Decimal | string | number): string {
  if (value instanceof Prisma.Decimal) return value.toFixed(2)
  return new Prisma.Decimal(value).toFixed(2)
}

export type PublicBusiness = {
  id: string
  name: string
  slug: string
  phone: string | null
  address: string | null
  description: string | null
  timezone: string
  primaryColor: string
  accentColor: string
  isDemo: boolean
  minAdvanceMinutes: number
  maxAdvanceDays: number
  cancelMinHours: number
  slotIntervalMinutes: number
  autoConfirm: boolean
}

export function toPublicBusiness(business: PublicBusiness): PublicBusiness {
  return {
    id: business.id,
    name: business.name,
    slug: business.slug,
    phone: business.phone,
    address: business.address,
    description: business.description,
    timezone: business.timezone,
    primaryColor: business.primaryColor,
    accentColor: business.accentColor,
    isDemo: business.isDemo,
    minAdvanceMinutes: business.minAdvanceMinutes,
    maxAdvanceDays: business.maxAdvanceDays,
    cancelMinHours: business.cancelMinHours,
    slotIntervalMinutes: business.slotIntervalMinutes,
    autoConfirm: business.autoConfirm,
  }
}

export type ServiceDto = {
  id: string
  name: string
  description: string | null
  durationMinutes: number
  price: string
  bufferMinutes: number
  active: boolean
}

export function toServiceDto(service: {
  id: string
  name: string
  description: string | null
  durationMinutes: number
  price: Prisma.Decimal
  bufferMinutes: number
  active: boolean
}): ServiceDto {
  return {
    id: service.id,
    name: service.name,
    description: service.description,
    durationMinutes: service.durationMinutes,
    price: decimalToString(service.price),
    bufferMinutes: service.bufferMinutes,
    active: service.active,
  }
}

export type ProfessionalDto = {
  id: string
  name: string
  email: string | null
  phone: string | null
  bio: string | null
  color: string
  active: boolean
  serviceIds: string[]
  hasLogin: boolean
}

export function toProfessionalDto(
  professional: {
    id: string
    name: string
    email: string | null
    phone: string | null
    bio: string | null
    color: string
    active: boolean
    userId: string | null
    services: { serviceId: string }[]
  },
  options?: { publicView?: boolean },
): ProfessionalDto {
  return {
    id: professional.id,
    name: professional.name,
    email: options?.publicView ? null : professional.email,
    phone: options?.publicView ? null : professional.phone,
    bio: professional.bio,
    color: professional.color,
    active: professional.active,
    serviceIds: professional.services.map((item) => item.serviceId),
    hasLogin: Boolean(professional.userId),
  }
}

export type AppointmentDto = {
  id: string
  startsAt: string
  endsAt: string
  blockedUntil: string
  status: AppointmentStatus
  notes: string | null
  price: string
  cancelReason: string | null
  service: { id: string; name: string; durationMinutes: number }
  professional: { id: string; name: string; color: string }
  customer: { id: string; name: string; phone?: string; email?: string | null }
}

type AppointmentRecord = {
  id: string
  startsAt: Date
  endsAt: Date
  blockedUntil: Date
  status: AppointmentStatus
  notes: string | null
  priceSnapshot: Prisma.Decimal
  cancelReason: string | null
  service: { id: string; name: string; durationMinutes: number }
  professional: { id: string; name: string; color: string }
  customer: { id: string; name: string; phone: string; email: string | null }
}

export function toAppointmentDto(appointment: AppointmentRecord, exposeCustomerContact: boolean): AppointmentDto {
  return {
    id: appointment.id,
    startsAt: appointment.startsAt.toISOString(),
    endsAt: appointment.endsAt.toISOString(),
    blockedUntil: appointment.blockedUntil.toISOString(),
    status: appointment.status,
    notes: appointment.notes,
    price: decimalToString(appointment.priceSnapshot),
    cancelReason: appointment.cancelReason,
    service: appointment.service,
    professional: appointment.professional,
    customer: exposeCustomerContact
      ? {
          id: appointment.customer.id,
          name: appointment.customer.name,
          phone: appointment.customer.phone,
          email: appointment.customer.email,
        }
      : { id: appointment.customer.id, name: appointment.customer.name },
  }
}

export const appointmentInclude = {
  service: { select: { id: true, name: true, durationMinutes: true } },
  professional: { select: { id: true, name: true, color: true } },
  customer: { select: { id: true, name: true, phone: true, email: true } },
} as const

export function canSeeCustomerContact(role: Role | 'PUBLIC'): boolean {
  return role === 'ADMIN' || role === 'PROFESSIONAL'
}
