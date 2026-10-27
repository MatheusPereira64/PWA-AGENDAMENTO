import { canTransition, statusLabel, type AppointmentStatus } from '@mp-agenda/shared'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DateTime } from 'luxon'
import { useState } from 'react'
import { toast } from 'sonner'
import { Badge, Button, ConfirmDialog, Empty, Field, Input, Modal, Select, Skeleton, statusTone } from '@/components/ui'
import { api, ApiError } from '@/lib/api'
import { useMembership } from '@/lib/auth'
import { formatTime } from '@/lib/format'
import type { AppointmentItem, Page, ProfessionalItem, ServiceItem, Slot } from '@/lib/types'

type CustomerItem = {
  id: string
  name: string
  phone: string
  email: string | null
}

export function AgendaPage() {
  const membership = useMembership()
  const zone = membership?.business.timezone ?? 'America/Sao_Paulo'
  const [cursor, setCursor] = useState(DateTime.now().setZone(zone).toISODate()!)
  const [view, setView] = useState<'day' | 'week' | 'month'>('day')
  const [professionalId, setProfessionalId] = useState('')
  const [status, setStatus] = useState('')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const day = DateTime.fromISO(cursor, { zone })
  const rangeStart = view === 'month' ? day.startOf('month') : view === 'week' ? day.startOf('week') : day.startOf('day')
  const rangeEnd = view === 'month' ? day.endOf('month') : view === 'week' ? day.endOf('week') : day.endOf('day')

  const appointments = useQuery({
    queryKey: ['appointments', membership?.business.id, rangeStart.toISO(), rangeEnd.toISO(), professionalId, status, q],
    enabled: Boolean(membership),
    queryFn: () => {
      const params = new URLSearchParams({
        from: rangeStart.toUTC().toISO()!,
        to: rangeEnd.toUTC().toISO()!,
        pageSize: '100',
      })
      if (professionalId) params.set('professionalId', professionalId)
      if (status) params.set('status', status)
      if (q) params.set('q', q)
      return api<Page<AppointmentItem>>(`/api/appointments?${params}`)
    },
  })
  const professionals = useQuery({
    queryKey: ['professionals', membership?.business.id],
    enabled: membership?.role !== 'CUSTOMER',
    queryFn: () => api<Page<ProfessionalItem>>('/api/professionals?pageSize=100'),
  })

  const step = view === 'month' ? { months: 1 } : view === 'week' ? { weeks: 1 } : { days: 1 }

  return (
    <div className="grid gap-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-4xl">Agenda</h1>
          <p className="text-sm text-muted capitalize">{day.setLocale('pt-BR').toFormat('LLLL yyyy')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="line" onClick={() => setCursor(day.minus(step).toISODate()!)}>
            Anterior
          </Button>
          <Button variant="line" onClick={() => setCursor(DateTime.now().setZone(zone).toISODate()!)}>
            Hoje
          </Button>
          <Button variant="line" onClick={() => setCursor(day.plus(step).toISODate()!)}>
            Próximo
          </Button>
          {membership?.role !== 'CUSTOMER' ? <Button onClick={() => setOpen(true)}>Novo</Button> : null}
        </div>
      </header>
      <div className="flex flex-wrap gap-2">
        {(['day', 'week', 'month'] as const).map((item) => (
          <Button key={item} variant={view === item ? 'primary' : 'line'} onClick={() => setView(item)}>
            {item === 'day' ? 'Dia' : item === 'week' ? 'Semana' : 'Mês'}
          </Button>
        ))}
        <Input className="max-w-56" placeholder="Buscar cliente" value={q} onChange={(event) => setQ(event.target.value)} aria-label="Buscar cliente" />
        <Select className="max-w-48" value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Status">
          <option value="">Status</option>
          {['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'].map((item) => (
            <option key={item} value={item}>
              {statusLabel(item as AppointmentStatus)}
            </option>
          ))}
        </Select>
        {membership?.role === 'ADMIN' ? (
          <Select className="max-w-52" value={professionalId} onChange={(event) => setProfessionalId(event.target.value)} aria-label="Profissional">
            <option value="">Todos os profissionais</option>
            {professionals.data?.data.map((professional) => (
              <option key={professional.id} value={professional.id}>
                {professional.name}
              </option>
            ))}
          </Select>
        ) : null}
      </div>
      {appointments.isLoading ? (
        <div className="grid gap-2" aria-busy="true">
          {['manha', 'tarde', 'noite'].map((item) => (
            <Skeleton key={item} className="h-20" />
          ))}
        </div>
      ) : null}
      {appointments.isError ? <p className="text-danger">Não foi possível carregar a agenda.</p> : null}
      {view === 'month' ? (
        <MonthGrid zone={zone} anchor={day} items={appointments.data?.data ?? []} onPick={(iso) => { setCursor(iso); setView('day') }} />
      ) : appointments.data?.data.length === 0 ? (
        <Empty
          title="Agenda livre"
          text="Nenhum atendimento neste recorte."
          action={membership?.role !== 'CUSTOMER' ? <Button onClick={() => setOpen(true)}>Novo horário</Button> : undefined}
        />
      ) : (
        <div className="grid gap-2">
          {appointments.data?.data.map((item) => (
            <AppointmentRow key={item.id} item={item} zone={zone} canEdit={membership?.role !== 'CUSTOMER'} />
          ))}
        </div>
      )}
      <CreateAppointment open={open} onOpenChange={setOpen} zone={zone} />
    </div>
  )
}

function AppointmentRow({ item, zone, canEdit }: { item: AppointmentItem; zone: string; canEdit: boolean }) {
  const client = useQueryClient()
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [error, setError] = useState<string>()
  const update = useMutation({
    mutationFn: (status: AppointmentStatus) =>
      api(`/api/appointments/${item.id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    onSuccess: () => {
      setError(undefined)
      toast.success('Agenda atualizada')
      client.invalidateQueries({ queryKey: ['appointments'] })
      client.invalidateQueries({ queryKey: ['summary'] })
    },
    onError: (caught) => setError(caught instanceof ApiError ? caught.message : 'Falha ao atualizar'),
  })
  return (
    <article className="grid gap-2 rounded-3xl border border-line bg-card p-4 md:grid-cols-[8rem_1fr_auto]">
      <div>
        <p className="font-medium tabular-nums">{formatTime(item.startsAt, zone)}</p>
        <p className="text-xs text-muted tabular-nums">{formatTime(item.endsAt, zone)}</p>
      </div>
      <div>
        <p className="font-medium">{item.customer.name}</p>
        <p className="text-sm text-muted">
          {item.service.name} · {item.professional.name}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={statusTone(item.status)}>{statusLabel(item.status)}</Badge>
        {canEdit
          ? (['CONFIRMED', 'COMPLETED', 'NO_SHOW', 'CANCELLED'] as AppointmentStatus[])
              .filter((status) => canTransition(item.status, status))
              .map((status) => (
                <Button
                  key={status}
                  variant="line"
                  disabled={update.isPending}
                  onClick={() => (status === 'CANCELLED' ? setConfirmCancel(true) : update.mutate(status))}
                >
                  {statusLabel(status)}
                </Button>
              ))
          : null}
        {!canEdit && item.status !== 'CANCELLED' ? (
          <Button variant="line" onClick={() => setConfirmCancel(true)}>
            Cancelar
          </Button>
        ) : null}
      </div>
      {error ? <p className="text-sm text-danger md:col-span-3">{error}</p> : null}
      <ConfirmDialog
        open={confirmCancel}
        title="Cancelar horário"
        text="O horário volta a ficar disponível. Essa ação não pode ser desfeita pelo cliente."
        confirmLabel="Cancelar horário"
        pending={update.isPending}
        onOpenChange={setConfirmCancel}
        onConfirm={() => update.mutate('CANCELLED')}
      />
    </article>
  )
}

function MonthGrid({
  zone,
  anchor,
  items,
  onPick,
}: {
  zone: string
  anchor: DateTime
  items: AppointmentItem[]
  onPick: (iso: string) => void
}) {
  const start = anchor.startOf('month').startOf('week')
  const days = Array.from({ length: 42 }, (_, index) => start.plus({ days: index }))
  return (
    <div className="grid grid-cols-7 gap-1">
      {days.map((day) => {
        const count = items.filter((item) => DateTime.fromISO(item.startsAt, { zone: 'utc' }).setZone(zone).toISODate() === day.toISODate()).length
        return (
          <button key={day.toISODate()} className="min-h-16 rounded-2xl border border-line bg-card p-2 text-left text-sm" onClick={() => onPick(day.toISODate()!)}>
            <span className={day.month === anchor.month ? '' : 'text-muted'}>{day.day}</span>
            {count > 0 ? <span className="mt-2 block text-xs text-pine">{count} horário(s)</span> : null}
          </button>
        )
      })}
    </div>
  )
}

function CreateAppointment({ open, onOpenChange, zone }: { open: boolean; onOpenChange: (open: boolean) => void; zone: string }) {
  const client = useQueryClient()
  const [serviceId, setServiceId] = useState('')
  const [professionalId, setProfessionalId] = useState('')
  const [date, setDate] = useState(DateTime.now().setZone(zone).toISODate()!)
  const [slot, setSlot] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const services = useQuery({
    queryKey: ['services-options'],
    enabled: open,
    queryFn: () => api<Page<ServiceItem>>('/api/services?pageSize=100&active=true'),
  })
  const professionals = useQuery({
    queryKey: ['professionals-options', serviceId],
    enabled: open && Boolean(serviceId),
    queryFn: () => api<Page<ProfessionalItem>>(`/api/professionals?pageSize=100&serviceId=${serviceId}`),
  })
  const slots = useQuery({
    queryKey: ['staff-slots', serviceId, professionalId, date],
    enabled: open && Boolean(serviceId && date),
    queryFn: () => {
      const params = new URLSearchParams({ serviceId, date })
      if (professionalId) params.set('professionalId', professionalId)
      return api<{ slots: Slot[] }>(`/api/availability?${params}`)
    },
  })
  const customers = useQuery({
    queryKey: ['customers-options'],
    enabled: open,
    queryFn: () => api<Page<CustomerItem>>('/api/customers?pageSize=100'),
  })
  const create = useMutation({
    mutationFn: () =>
      api('/api/appointments', {
        method: 'POST',
        body: JSON.stringify({
          serviceId,
          professionalId: professionalId || undefined,
          startsAt: slot,
          customerId: customerId || undefined,
          customer: customerId ? undefined : { name, phone },
        }),
      }),
    onSuccess: () => {
      toast.success('Agendamento criado')
      onOpenChange(false)
      client.invalidateQueries({ queryKey: ['appointments'] })
      client.invalidateQueries({ queryKey: ['summary'] })
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Não foi possível criar'),
  })

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Novo agendamento">
      <div className="grid gap-3">
        <Field label="Serviço">
          <Select value={serviceId} onChange={(event) => setServiceId(event.target.value)}>
            <option value="">Selecione</option>
            {services.data?.data.map((service) => (
              <option key={service.id} value={service.id}>{service.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Profissional">
          <Select value={professionalId} onChange={(event) => setProfessionalId(event.target.value)}>
            <option value="">Qualquer disponível</option>
            {professionals.data?.data.map((professional) => (
              <option key={professional.id} value={professional.id}>{professional.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Data">
          <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </Field>
        <Field label="Horário">
          <Select value={slot} onChange={(event) => setSlot(event.target.value)}>
            <option value="">Selecione</option>
            {slots.data?.slots.map((item) => (
              <option key={item.startsAt} value={item.startsAt}>{item.label}</option>
            ))}
          </Select>
        </Field>
        <Field label="Cliente existente">
          <Select value={customerId} onChange={(event) => setCustomerId(event.target.value)}>
            <option value="">Novo cliente</option>
            {customers.data?.data.map((customer) => (
              <option key={customer.id} value={customer.id}>{customer.name}</option>
            ))}
          </Select>
        </Field>
        {!customerId ? (
          <>
            <Field label="Nome"><Input value={name} onChange={(event) => setName(event.target.value)} /></Field>
            <Field label="Telefone"><Input value={phone} onChange={(event) => setPhone(event.target.value)} /></Field>
          </>
        ) : null}
        <Button disabled={!slot || create.isPending} onClick={() => create.mutate()}>Salvar</Button>
      </div>
    </Modal>
  )
}
