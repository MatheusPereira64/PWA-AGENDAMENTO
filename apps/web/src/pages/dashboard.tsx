import { useQuery } from '@tanstack/react-query'
import { statusLabel } from '@mp-agenda/shared'
import { useState } from 'react'
import { Badge, Card, Empty, Select } from '@/components/ui'
import { api } from '@/lib/api'
import { useMembership } from '@/lib/auth'
import { formatDateTime, formatMoney } from '@/lib/format'

type Summary = {
  todayCount: number
  customerCount: number
  cancellations: number
  estimatedRevenue: string
  topServices: { serviceId: string; name: string; count: number }[]
  upcoming: {
    id: string
    startsAt: string
    status: string
    serviceName: string
    professionalName: string
    customerName: string
  }[]
  attendance: { completed: number; noShow: number; rate: number | null; cancelled: number }
  period: { from: string; to: string }
}

export function DashboardPage() {
  const membership = useMembership()
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [status, setStatus] = useState('')
  const zone = membership?.business.timezone ?? 'America/Sao_Paulo'
  const query = useQuery({
    queryKey: ['summary', membership?.business.id, from, to, status],
    enabled: Boolean(membership),
    queryFn: () => {
      const params = new URLSearchParams()
      if (from) params.set('from', from)
      if (to) params.set('to', to)
      if (status) params.set('status', status)
      return api<Summary>(`/api/dashboard/summary?${params}`)
    },
  })

  if (query.isLoading) return <p>Calculando indicadores…</p>
  if (query.isError || !query.data) return <p>Não foi possível carregar o painel.</p>
  const summary = query.data

  return (
    <div className="grid gap-5">
      <header>
        <h1 className="font-serif text-4xl">Painel</h1>
        <p className="text-sm text-muted">Números calculados a partir dos agendamentos gravados.</p>
      </header>
      <div className="flex flex-wrap gap-2">
        <input className="h-11 rounded-2xl border border-line bg-card px-3" type="date" value={from} onChange={(event) => setFrom(event.target.value)} aria-label="De" />
        <input className="h-11 rounded-2xl border border-line bg-card px-3" type="date" value={to} onChange={(event) => setTo(event.target.value)} aria-label="Até" />
        <Select className="max-w-48" value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Status">
          <option value="">Todos os status</option>
          {['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'].map((item) => (
            <option key={item} value={item}>
              {statusLabel(item as 'PENDING')}
            </option>
          ))}
        </Select>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Hoje" value={String(summary.todayCount)} />
        <Metric label="Clientes" value={String(summary.customerCount)} />
        <Metric label="Cancelamentos" value={String(summary.cancellations)} />
        <Metric label="Receita estimada" value={formatMoney(summary.estimatedRevenue)} />
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <h2 className="font-serif text-2xl">Próximos</h2>
          <div className="mt-3 grid gap-3">
            {summary.upcoming.length === 0 ? <Empty title="Nada à frente" text="Os próximos horários aparecem aqui." /> : null}
            {summary.upcoming.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 border-b border-line pb-2">
                <div>
                  <p className="font-medium">{item.customerName}</p>
                  <p className="text-sm text-muted">
                    {item.serviceName} · {item.professionalName}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p>{formatDateTime(item.startsAt, zone)}</p>
                  <Badge>{statusLabel(item.status as 'PENDING')}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="font-serif text-2xl">Serviços no período</h2>
          <p className="text-sm text-muted">
            Comparecimento:{' '}
            {summary.attendance.rate === null ? 'sem base ainda' : `${Math.round(summary.attendance.rate * 100)}%`}
          </p>
          <ul className="mt-3 space-y-2">
            {summary.topServices.length === 0 ? <li className="text-sm text-muted">Nenhum serviço no período.</li> : null}
            {summary.topServices.map((service) => (
              <li key={service.serviceId} className="flex justify-between">
                <span>{service.name}</span>
                <strong>{service.count}</strong>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-sm text-muted">{label}</p>
      <p className="font-serif text-3xl">{value}</p>
    </Card>
  )
}
