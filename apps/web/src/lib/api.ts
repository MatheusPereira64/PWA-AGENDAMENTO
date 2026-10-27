import type { SessionUser } from './types'

const base = import.meta.env.VITE_API_URL ?? ''
let accessToken: string | null = null
let businessId: string | null = sessionStorage.getItem('mp-business')

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message)
  }
}

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
}

export function setBusinessId(id: string | null) {
  businessId = id
  if (id) sessionStorage.setItem('mp-business', id)
  else sessionStorage.removeItem('mp-business')
}

export function getBusinessId() {
  return businessId
}

type Options = RequestInit & { business?: boolean }

export async function api<T>(path: string, options: Options = {}): Promise<T> {
  const method = (options.method ?? 'GET').toUpperCase()
  if (!navigator.onLine && method !== 'GET') {
    throw new ApiError(0, 'OFFLINE', 'Sem conexão. O envio não foi feito — a disponibilidade precisa ser confirmada pelo servidor.')
  }

  const headers = new Headers(options.headers)
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)
  if (options.business !== false && businessId) headers.set('X-Business-Id', businessId)

  let response: Response
  try {
    response = await fetch(`${base}${path}`, { ...options, headers, credentials: 'include' })
  } catch {
    throw new ApiError(0, 'OFFLINE', 'Sem conexão com a API. Os dados em tela podem estar desatualizados.')
  }

  if (response.status === 401 && !path.startsWith('/api/auth/')) {
    const refreshed = await refreshSession()
    if (refreshed) return api<T>(path, options)
  }

  if (response.status === 204) return undefined as T
  const payload = (await response.json().catch(() => null)) as { code?: string; message?: string } | null
  if (!response.ok) {
    throw new ApiError(response.status, payload?.code ?? 'ERROR', payload?.message ?? 'Não foi possível concluir a ação')
  }
  return payload as T
}

let refreshInFlight: Promise<{ accessToken: string; user: SessionUser } | null> | null = null

export function refreshSession() {
  if (!refreshInFlight) {
    refreshInFlight = refreshSessionOnce().finally(() => {
      refreshInFlight = null
    })
  }
  return refreshInFlight
}

async function refreshSessionOnce() {
  try {
    const response = await fetch(`${base}/api/auth/refresh`, { method: 'POST', credentials: 'include' })
    if (!response.ok) {
      accessToken = null
      return null
    }
    const data = (await response.json()) as { accessToken: string; user: SessionUser }
    accessToken = data.accessToken
    return data
  } catch {
    return null
  }
}
