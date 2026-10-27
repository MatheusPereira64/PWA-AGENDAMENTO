import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, refreshSession, setAccessToken, setBusinessId } from './api'
import type { SessionUser } from './types'

type AuthState = {
  user: SessionUser | null
  ready: boolean
  businessId: string | null
  login: (email: string, password: string) => Promise<void>
  register: (input: Record<string, string>) => Promise<void>
  logout: () => Promise<void>
  selectBusiness: (id: string) => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [ready, setReady] = useState(false)
  const [businessId, setCurrentBusiness] = useState<string | null>(null)

  function adopt(next: SessionUser, token: string) {
    setAccessToken(token)
    setUser(next)
    const stored = sessionStorage.getItem('mp-business')
    const chosen = next.memberships.find((item) => item.business.id === stored) ?? next.memberships[0]
    const id = chosen?.business.id ?? null
    setBusinessId(id)
    setCurrentBusiness(id)
  }

  useEffect(() => {
    refreshSession()
      .then((session) => {
        if (session) adopt(session.user, session.accessToken)
      })
      .finally(() => setReady(true))
  }, [])

  const value = useMemo<AuthState>(
    () => ({
      user,
      ready,
      businessId,
      async login(email, password) {
        const result = await api<{ accessToken: string; user: SessionUser }>('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
          business: false,
        })
        adopt(result.user, result.accessToken)
      },
      async register(input) {
        const result = await api<{ accessToken: string; user: SessionUser }>('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify(input),
          business: false,
        })
        adopt(result.user, result.accessToken)
      },
      async logout() {
        await api('/api/auth/logout', { method: 'POST', business: false })
        setAccessToken(null)
        setBusinessId(null)
        setUser(null)
        setCurrentBusiness(null)
      },
      selectBusiness(id) {
        setBusinessId(id)
        setCurrentBusiness(id)
      },
    }),
    [user, ready, businessId],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('AuthProvider ausente')
  return context
}

export function useMembership() {
  const { user, businessId } = useAuth()
  return user?.memberships.find((item) => item.business.id === businessId) ?? null
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth()
  const navigate = useNavigate()
  useEffect(() => {
    if (ready && !user) navigate('/entrar', { replace: true })
  }, [ready, user, navigate])
  if (!ready) return <p className="p-8 text-muted">Abrindo sua sessão…</p>
  if (!user) return null
  return children
}
