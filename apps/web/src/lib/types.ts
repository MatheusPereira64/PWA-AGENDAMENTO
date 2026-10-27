import type { AppointmentStatus, Role } from '@mp-agenda/shared'

export type BusinessSummary = {
  id: string
  name: string
  slug: string
  timezone: string
  isDemo: boolean
  primaryColor: string
  accentColor: string
}

export type SessionUser = {
  id: string
  name: string
  email: string
  memberships: {
    id: string
    role: Role
    professionalId: string | null
    business: BusinessSummary
  }[]
}

export type ServiceItem = {
  id: string
  name: string
  description: string | null
  durationMinutes: number
  price: string
  bufferMinutes: number
  active: boolean
}

export type ProfessionalItem = {
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

export type AppointmentItem = {
  id: string
  startsAt: string
  endsAt: string
  status: AppointmentStatus
  notes: string | null
  price: string
  cancelReason: string | null
  service: { id: string; name: string; durationMinutes: number }
  professional: { id: string; name: string; color: string }
  customer: { id: string; name: string; phone?: string; email?: string | null }
}

export type Page<T> = { data: T[]; total: number; page: number; pageSize: number }

export type PublicBusiness = BusinessSummary & {
  phone: string | null
  address: string | null
  description: string | null
  minAdvanceMinutes: number
  maxAdvanceDays: number
  cancelMinHours: number
  slotIntervalMinutes: number
  autoConfirm: boolean
}

export type Slot = {
  startsAt: string
  endsAt: string
  label: string
  professionalIds: string[]
}
