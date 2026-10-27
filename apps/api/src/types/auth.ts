import type { Role } from '@mp-agenda/shared'

export type AuthUser = {
  id: string
  name: string
  email: string
}

export type MembershipContext = {
  id: string
  role: Role
  businessId: string
  professionalId: string | null
  business: {
    id: string
    name: string
    slug: string
    timezone: string
    isDemo: boolean
  }
}
