import { statusLabel, type AppointmentStatus } from '@mp-agenda/shared'
import { NavLink, Outlet } from 'react-router-dom'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { OfflineBanner } from '@/components/offline-banner'
import { Button } from '@/components/ui'
import { useAuth, useMembership } from '@/lib/auth'
import { cn } from '@/lib/utils'

const links = [
  { to: '/app', label: 'Painel', end: true, roles: ['ADMIN', 'PROFESSIONAL', 'CUSTOMER'] },
  { to: '/app/agenda', label: 'Agenda', roles: ['ADMIN', 'PROFESSIONAL', 'CUSTOMER'] },
  { to: '/app/clientes', label: 'Clientes', roles: ['ADMIN', 'PROFESSIONAL'] },
  { to: '/app/servicos', label: 'Serviços', roles: ['ADMIN'] },
  { to: '/app/profissionais', label: 'Profissionais', roles: ['ADMIN'] },
  { to: '/app/configuracoes', label: 'Configurações', roles: ['ADMIN'] },
  { to: '/app/auditoria', label: 'Auditoria', roles: ['ADMIN'] },
]

export function AppShell() {
  const { user, logout, selectBusiness } = useAuth()
  const membership = useMembership()
  const { needRefresh, updateServiceWorker } = useRegisterSW()
  const role = membership?.role
  const visible = links.filter((link) => role && link.roles.includes(role))

  return (
    <div className="min-h-dvh">
      <OfflineBanner />
      {needRefresh ? (
        <div className="flex items-center justify-between gap-3 bg-brass/30 px-4 py-2 text-sm">
          <span>Há uma nova versão do MP Agenda.</span>
          <Button variant="line" onClick={() => updateServiceWorker(true)}>
            Atualizar
          </Button>
        </div>
      ) : null}
      {membership?.business.isDemo ? (
        <div className="bg-pine px-4 py-2 text-center text-sm text-paper">
          Demonstração do Studio Aurora. Os horários e clientes são fictícios.
        </div>
      ) : null}
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-5 md:grid-cols-[220px_1fr]">
        <aside className="flex flex-col gap-4">
          <div>
            <p className="text-xs text-muted uppercase">MP Software</p>
            <p className="font-serif text-3xl">Agenda</p>
          </div>
          {user && user.memberships.length > 1 ? (
            <label className="grid gap-1 text-sm">
              Negócio
              <select
                className="h-11 rounded-2xl border border-line bg-card px-3"
                value={membership?.business.id}
                onChange={(event) => selectBusiness(event.target.value)}
              >
                {user.memberships.map((item) => (
                  <option key={item.id} value={item.business.id}>
                    {item.business.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <p className="text-sm text-muted">{membership?.business.name}</p>
          )}
          <nav className="flex gap-2 overflow-auto md:flex-col">
            {visible.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  cn('rounded-full px-3 py-2 text-sm whitespace-nowrap', isActive ? 'bg-ink text-paper' : 'hover:bg-white')
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <button className="mt-auto text-left text-sm text-muted" onClick={() => logout()}>
            Sair de {user?.name}
          </button>
        </aside>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export function StatusText({ status }: { status: AppointmentStatus }) {
  return <>{statusLabel(status)}</>
}
