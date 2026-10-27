import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { OfflineBanner } from '@/components/offline-banner'
import { useOnline } from '@/components/offline-banner'
import { Badge, Button, Card, ConfirmDialog, Field, Input, Skeleton } from '@/components/ui'
import { api, ApiError } from '@/lib/api'
import { formatDateTime, formatMoney } from '@/lib/format'
import type { AppointmentItem, ProfessionalItem, PublicBusiness, ServiceItem, Slot } from '@/lib/types'

export function BookingPage() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const online = useOnline()
  const business = useQuery({
    queryKey: ['public-business', slug],
    queryFn: () => api<{ business: PublicBusiness }>(`/api/businesses/${slug}`, { business: false }),
  })
  const services = useQuery({
    queryKey: ['public-services', slug],
    queryFn: () => api<{ data: ServiceItem[] }>(`/api/businesses/${slug}/services`, { business: false }),
  })
  const [serviceId, setServiceId] = useState<string>()
  const [professionalId, setProfessionalId] = useState('any')
  const [date, setDate] = useState('')
  const [slot, setSlot] = useState<Slot>()
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '' })
  const [submitError, setSubmitError] = useState<string>()

  const professionals = useQuery({
    queryKey: ['public-professionals', slug, serviceId],
    enabled: Boolean(serviceId),
    queryFn: () =>
      api<{ data: ProfessionalItem[] }>(`/api/businesses/${slug}/professionals?serviceId=${serviceId}`, {
        business: false,
      }),
  })
  const availability = useQuery({
    queryKey: ['availability', slug, serviceId, professionalId, date],
    enabled: Boolean(serviceId && date),
    queryFn: () => {
      const params = new URLSearchParams({ serviceId: serviceId!, date })
      if (professionalId !== 'any') params.set('professionalId', professionalId)
      return api<{ slots: Slot[] }>(`/api/businesses/${slug}/availability?${params}`, { business: false })
    },
  })
  const create = useMutation({
    mutationFn: () =>
      api<{ appointment: AppointmentItem; accessToken: string | null; managePath: string | null }>(
        `/api/businesses/${slug}/appointments`,
        {
          method: 'POST',
          business: false,
          body: JSON.stringify({
            serviceId,
            professionalId: professionalId === 'any' ? undefined : professionalId,
            startsAt: slot?.startsAt,
            customer: {
              name: customer.name,
              phone: customer.phone,
              email: customer.email || undefined,
            },
          }),
        },
      ),
    onMutate: () => setSubmitError(undefined),
    onSuccess: (result) => {
      navigate(`/b/${slug}/confirmacao`, { state: { ...result, timezone: profile?.timezone ?? 'America/Sao_Paulo' } })
    },
    onError: (caught) => {
      setSubmitError(caught instanceof ApiError ? caught.message : 'Não foi possível agendar')
    },
  })

  const profile = business.data?.business
  if (business.isLoading) {
    return (
      <main className="mx-auto grid max-w-3xl gap-3 px-4 py-8" aria-busy="true">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-24" />
        <Skeleton className="h-40" />
      </main>
    )
  }
  if (business.isError || !profile) return <p className="p-8">Negócio não encontrado.</p>

  return (
    <div style={{ ['--brand' as string]: profile.primaryColor }}>
      <OfflineBanner />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link to="/" className="text-sm text-muted">
          MP Agenda
        </Link>
        <h1 className="mt-2 font-serif text-5xl" style={{ color: profile.primaryColor }}>
          {profile.name}
        </h1>
        <p className="mt-2 text-muted">{profile.description}</p>
        {profile.isDemo ? <Badge tone="warn">Dados de demonstração</Badge> : null}
        <p className="mt-2 text-sm text-muted">
          {profile.address} · {profile.phone}
        </p>

        <section className="mt-8 grid gap-3">
          <h2 className="font-serif text-2xl">1. Serviço</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {services.data?.data.map((service) => (
              <button
                key={service.id}
                className={`rounded-3xl border p-4 text-left ${serviceId === service.id ? 'border-ink bg-white' : 'border-line bg-card'}`}
                onClick={() => {
                  setServiceId(service.id)
                  setSlot(undefined)
                }}
              >
                <strong>{service.name}</strong>
                <p className="text-sm text-muted tabular-nums">
                  {service.durationMinutes} min · {formatMoney(service.price)}
                </p>
              </button>
            ))}
          </div>
        </section>

        {serviceId ? (
          <section className="mt-8">
            <h2 className="font-serif text-2xl">2. Profissional</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <Choice active={professionalId === 'any'} onClick={() => setProfessionalId('any')}>
                Qualquer disponível
              </Choice>
              {professionals.data?.data.map((professional) => (
                <Choice
                  key={professional.id}
                  active={professionalId === professional.id}
                  onClick={() => setProfessionalId(professional.id)}
                >
                  {professional.name}
                </Choice>
              ))}
            </div>
          </section>
        ) : null}

        {serviceId ? (
          <section className="mt-8">
            <h2 className="font-serif text-2xl">3. Data e horário</h2>
            <Input className="mt-3 max-w-xs" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            {availability.isLoading ? (
              <div className="mt-3 flex flex-wrap gap-2" aria-busy="true">
                {['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map((item) => (
                  <Skeleton key={item} className="h-11 w-24" />
                ))}
              </div>
            ) : null}
            {availability.isError ? <p className="mt-3 text-sm text-danger">Não foi possível consultar a agenda.</p> : null}
            {availability.data?.slots.length === 0 ? <p className="mt-3 text-sm">Nenhum horário livre nesta data.</p> : null}
            <div className="mt-3 flex flex-wrap gap-2">
              {availability.data?.slots.map((item) => (
                <Choice key={item.startsAt} active={slot?.startsAt === item.startsAt} onClick={() => setSlot(item)}>
                  {item.label}
                </Choice>
              ))}
            </div>
          </section>
        ) : null}

        {slot ? (
          <Card className="mt-8">
            <h2 className="font-serif text-2xl">4. Seus dados</h2>
            <div className="mt-4 grid gap-3">
              <Field label="Nome">
                <Input value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} />
              </Field>
              <Field label="Telefone">
                <Input value={customer.phone} onChange={(event) => setCustomer({ ...customer, phone: event.target.value })} />
              </Field>
              <Field label="E-mail (opcional)">
                <Input value={customer.email} onChange={(event) => setCustomer({ ...customer, email: event.target.value })} />
              </Field>
              {!online ? <p className="text-sm text-danger">Sem conexão. O agendamento não será enviado.</p> : null}
              {submitError ? <p className="text-sm text-danger">{submitError}</p> : null}
              <Button
                disabled={!online || create.isPending || customer.name.length < 2 || customer.phone.replace(/\D/g, '').length < 10}
                onClick={() => create.mutate()}
              >
                Confirmar horário
              </Button>
            </div>
          </Card>
        ) : null}
      </main>
    </div>
  )
}

function Choice({ active, children, onClick }: { active: boolean; children: string; onClick: () => void }) {
  return (
    <button
      className={`rounded-full border px-4 py-2 text-sm ${active ? 'border-ink bg-ink text-paper' : 'border-line bg-card'}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export function ConfirmationPage() {
  const { slug = '' } = useParams()
  const location = useLocation()
  const state = location.state as
    | { appointment: AppointmentItem; accessToken: string | null; managePath: string | null; timezone?: string }
    | null
  if (!state?.appointment) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16">
        <p>Abra a confirmação logo depois de agendar.</p>
        <Link to={`/b/${slug}`}>Voltar</Link>
      </main>
    )
  }
  return (
    <main className="mx-auto max-w-lg px-4 py-16">
      <p className="text-sm text-pine">Horário reservado</p>
      <h1 className="font-serif text-4xl">{state.appointment.service.name}</h1>
      <p className="mt-3">
        {formatDateTime(state.appointment.startsAt, state.timezone ?? 'America/Sao_Paulo')} com {state.appointment.professional.name}
      </p>
      <p className="text-muted tabular-nums">{formatMoney(state.appointment.price)}</p>
      {state.managePath ? (
        <p className="mt-6 text-sm">
          Guarde este link para consultar ou cancelar:{' '}
          <Link className="text-pine" to={state.managePath}>
            abrir agendamento
          </Link>
        </p>
      ) : null}
    </main>
  )
}

export function ManageAppointmentPage() {
  const { id = '' } = useParams()
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const online = useOnline()
  const query = useQuery({
    queryKey: ['manage', id, token],
    enabled: Boolean(token),
    queryFn: () =>
      api<{ appointment: AppointmentItem; business: { name: string; timezone: string; cancelMinHours: number } }>(
        `/api/public/appointments/${id}?token=${encodeURIComponent(token)}`,
        { business: false },
      ),
  })
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [error, setError] = useState<string>()
  const cancel = useMutation({
    mutationFn: () =>
      api(`/api/public/appointments/${id}/cancel`, {
        method: 'POST',
        business: false,
        body: JSON.stringify({ token }),
      }),
    onSuccess: () => {
      setError(undefined)
      toast.success('Agendamento cancelado')
      query.refetch()
    },
    onError: (caught) => setError(caught instanceof ApiError ? caught.message : 'Não foi possível cancelar'),
  })
  if (!token) return <p className="p-8">Link incompleto.</p>
  if (query.isLoading) {
    return (
      <main className="mx-auto grid max-w-lg gap-3 px-4 py-12" aria-busy="true">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-16" />
      </main>
    )
  }
  if (query.isError || !query.data) return <p className="p-8">Agendamento não encontrado.</p>
  const { appointment, business } = query.data
  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <OfflineBanner />
      <p className="text-sm text-muted">{business.name}</p>
      <h1 className="font-serif text-4xl">{appointment.service.name}</h1>
      <p className="mt-2 tabular-nums">{formatDateTime(appointment.startsAt, business.timezone)}</p>
      <p>{appointment.professional.name}</p>
      <p className="mt-2 text-sm text-muted">Cancelamento até {business.cancelMinHours}h antes.</p>
      {appointment.status !== 'CANCELLED' ? (
        <Button className="mt-6" variant="danger" disabled={!online || cancel.isPending} onClick={() => setConfirmCancel(true)}>
          Cancelar agendamento
        </Button>
      ) : (
        <p className="mt-6">Este horário foi cancelado.</p>
      )}
      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      <ConfirmDialog
        open={confirmCancel}
        title="Cancelar agendamento"
        text="O horário deixa de ser seu. Confirme só se realmente não puder comparecer."
        confirmLabel="Cancelar agendamento"
        pending={cancel.isPending}
        onOpenChange={setConfirmCancel}
        onConfirm={() => cancel.mutate()}
      />
    </main>
  )
}

export function OfflinePage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-16">
      <h1 className="font-serif text-4xl">Sem conexão</h1>
      <p className="mt-3 text-muted">
        O aplicativo abre com os arquivos já salvos. Formulários que dependem da API ficam bloqueados até a internet voltar. Nenhum horário é confirmado offline.
      </p>
      <Link to="/">Voltar ao início</Link>
    </main>
  )
}
