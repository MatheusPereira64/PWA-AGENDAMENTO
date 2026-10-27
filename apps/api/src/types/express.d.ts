import type { AuthUser, MembershipContext } from './auth.js'

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
      businessId?: string
      membership?: MembershipContext
    }
  }
}

export {}
