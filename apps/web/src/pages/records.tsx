import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Badge, Button, Card, ConfirmDialog, Empty, Field, Input, Modal, Skeleton, Textarea } from '@/components/ui'
import { api, ApiError } from '@/lib/api'
import { useMembership } from '@/lib/auth'
import { formatDateTime, formatMoney, weekdayLabel } from '@/lib/format'
import type { AppointmentItem, Page, ProfessionalItem, ServiceItem } from '@/lib/types'

type Customer = {
  id: string
  name: string
  phone: string
  email: string | null
  notes: string | null
  createdAt: string
}

export function CustomersPage() {
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const membership = useMembership()
  const query = useQuery({
    queryKey: ['customers', q, page, membership?.business.id],
    queryFn: () => api<Page<Customer>>(`/api/customers?q=${encodeURIComponent(q)}&page=${page}`),
  })
  return (
    <div className="grid gap-4">
      <header className="flex items-end justify-between gap-3">
        <h1 className="font-serif text-4xl">Clientes</h1>
        {membership?.role === 'ADMIN' ? <Button onClick={() => setOpen(true)}>Novo cliente</Button> : null}
      </header>
      <Input placeholder="Nome, telefone ou e-mail" value={q} onChange={(event) => { setQ(event.target.value); setPage(1) }} aria-label="Buscar clientes" />
      {query.isLoading ? (
        <div className="grid gap-2" aria-busy="true">
          {['a', 'b', 'c'].map((item) => (
            <Skeleton key={item} className="h-16" />
          ))}
        </div>
      ) : null}
      {query.data?.data.length === 0 ? (
        <Empty
          title="Nenhum cliente"
          text="Os clientes aparecem aqui quando alguém agenda ou é cadastrado."
          action={membership?.role === 'ADMIN' ? <Button onClick={() => setOpen(true)}>Cadastrar cliente</Button> : undefined}
        />
      ) : null}
      <div className="grid gap-2">
        {query.data?.data.map((customer) => (
          <Link key={customer.id} to={`/app/clientes/${customer.id}`} className="rounded-3xl border border-line bg-card p-4">
            <strong>{customer.name}</strong>
            <p className="text-sm text-muted">{customer.phone} · {customer.email ?? 'sem e-mail'}</p>
          </Link>
        ))}
      </div>
      <Pager page={page} total={query.data?.total ?? 0} pageSize={query.data?.pageSize ?? 20} onPage={setPage} />
      <CustomerForm open={open} onOpenChange={setOpen} />
    </div>
  )
}

export function CustomerDetailPage() {
  const { id = '' } = useParams()
  const membership = useMembership()
  const query = useQuery({
    queryKey: ['customer', id],
    queryFn: () => api<{ customer: Customer; appointments: AppointmentItem[] }>(`/api/customers/${id}`),
  })
  if (query.isLoading) return <Skeleton className="h-40" />
  if (query.isError || !query.data) return <p>Cliente não encontrado.</p>
  const zone = membership?.business.timezone ?? 'America/Sao_Paulo'
  return (
    <div className="grid gap-4">
      <Link to="/app/clientes" className="text-sm text-muted">Voltar</Link>
      <h1 className="font-serif text-4xl">{query.data.customer.name}</h1>
      <p className="text-muted">{query.data.customer.phone} · {query.data.customer.email}</p>
      {query.data.customer.notes ? <p>{query.data.customer.notes}</p> : null}
      <h2 className="font-serif text-2xl">Histórico</h2>
      {query.data.appointments.length === 0 ? (
        <Empty
          title="Sem atendimentos"
          text="O histórico fica nesta ficha."
          action={<Button asChild><Link to="/app/agenda">Abrir a agenda</Link></Button>}
        />
      ) : null}
      {query.data.appointments.map((item) => (
        <div key={item.id} className="rounded-2xl border border-line p-3">
          <p className="tabular-nums">{formatDateTime(item.startsAt, zone)} · {item.service.name}</p>
          <p className="text-sm text-muted tabular-nums">{item.professional.name} · {formatMoney(item.price)}</p>
        </div>
      ))}
    </div>
  )
}

function CustomerForm({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const client = useQueryClient()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const create = useMutation({
    mutationFn: () => api('/api/customers', { method: 'POST', body: JSON.stringify({ name, phone, email: email || undefined }) }),
    onSuccess: () => {
      toast.success('Cliente cadastrado')
      onOpenChange(false)
      client.invalidateQueries({ queryKey: ['customers'] })
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Falha ao salvar'),
  })
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Novo cliente">
      <div className="grid gap-3">
        <Field label="Nome"><Input value={name} onChange={(event) => setName(event.target.value)} /></Field>
        <Field label="Telefone"><Input value={phone} onChange={(event) => setPhone(event.target.value)} /></Field>
        <Field label="E-mail"><Input value={email} onChange={(event) => setEmail(event.target.value)} /></Field>
        <Button onClick={() => create.mutate()} disabled={create.isPending}>Salvar</Button>
      </div>
    </Modal>
  )
}

export function ServicesPage() {
  const client = useQueryClient()
  const query = useQuery({ queryKey: ['services'], queryFn: () => api<Page<ServiceItem>>('/api/services?pageSize=100') })
  const [form, setForm] = useState({ name: '', durationMinutes: '60', price: '', description: '' })
  const [pendingId, setPendingId] = useState<string | null>(null)
  const create = useMutation({
    mutationFn: () =>
      api('/api/services', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          durationMinutes: Number(form.durationMinutes),
          price: form.price,
          description: form.description || undefined,
        }),
      }),
    onSuccess: () => {
      toast.success('Serviço criado')
      setForm({ name: '', durationMinutes: '60', price: '', description: '' })
      client.invalidateQueries({ queryKey: ['services'] })
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Falha ao salvar'),
  })
  const remove = useMutation({
    mutationFn: (id: string) => api(`/api/services/${id}`, { method: 'DELETE' }),
    onSuccess: () => client.invalidateQueries({ queryKey: ['services'] }),
  })
  return (
    <div className="grid gap-4">
      <h1 className="font-serif text-4xl">Serviços</h1>
      <Card>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Nome"><Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
          <Field label="Duração (min)"><Input value={form.durationMinutes} onChange={(event) => setForm({ ...form, durationMinutes: event.target.value })} /></Field>
          <Field label="Preço"><Input value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} placeholder="80.00" /></Field>
          <Field label="Descrição"><Input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></Field>
        </div>
        <Button className="mt-3" onClick={() => create.mutate()} disabled={create.isPending}>Adicionar</Button>
      </Card>
      <div className="grid gap-2">
        {query.data?.data.map((service) => (
          <div key={service.id} className="flex items-center justify-between rounded-3xl border border-line bg-card p-4">
            <div>
              <p className="font-medium">{service.name} {!service.active ? <Badge>Arquivado</Badge> : null}</p>
              <p className="text-sm text-muted tabular-nums">{service.durationMinutes} min · {formatMoney(service.price)} · intervalo {service.bufferMinutes} min</p>
            </div>
            <Button variant="line" onClick={() => setPendingId(service.id)}>Remover</Button>
          </div>
        ))}
      </div>
      <ConfirmDialog
        open={pendingId !== null}
        title="Remover serviço"
        text="Se já houver histórico, o serviço é arquivado. Sem histórico, ele sai da lista."
        confirmLabel="Remover"
        pending={remove.isPending}
        onOpenChange={(open) => {
          if (!open) setPendingId(null)
        }}
        onConfirm={() => {
          if (!pendingId) return
          remove.mutate(pendingId, { onSuccess: () => setPendingId(null) })
        }}
      />
    </div>
  )
}

export function ProfessionalsPage() {
  const client = useQueryClient()
  const query = useQuery({ queryKey: ['professionals-admin'], queryFn: () => api<Page<ProfessionalItem>>('/api/professionals?pageSize=100') })
  const services = useQuery({ queryKey: ['services'], queryFn: () => api<Page<ServiceItem>>('/api/services?active=true&pageSize=100') })
  const [form, setForm] = useState({ name: '', bio: '', email: '', password: '', serviceIds: [] as string[] })
  const create = useMutation({
    mutationFn: () =>
      api('/api/professionals', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          bio: form.bio || undefined,
          email: form.email || undefined,
          password: form.password || undefined,
          serviceIds: form.serviceIds,
        }),
      }),
    onSuccess: () => {
      toast.success('Profissional cadastrado')
      client.invalidateQueries({ queryKey: ['professionals-admin'] })
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Falha ao salvar'),
  })
  return (
    <div className="grid gap-4">
      <h1 className="font-serif text-4xl">Profissionais</h1>
      <Card>
        <div className="grid gap-3">
          <Field label="Nome"><Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
          <Field label="Bio"><Textarea value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} /></Field>
          <Field label="E-mail de acesso"><Input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></Field>
          <Field label="Senha inicial"><Input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></Field>
          <fieldset>
            <legend className="text-sm font-medium">Serviços</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {services.data?.data.map((service) => (
                <label key={service.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.serviceIds.includes(service.id)}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        serviceIds: event.target.checked
                          ? [...form.serviceIds, service.id]
                          : form.serviceIds.filter((id) => id !== service.id),
                      })
                    }
                  />
                  {service.name}
                </label>
              ))}
            </div>
          </fieldset>
          <p className="text-xs text-muted">Quem não tiver expediente próprio usa o horário do negócio.</p>
          <Button onClick={() => create.mutate()} disabled={create.isPending}>Adicionar</Button>
        </div>
      </Card>
      {query.data?.data.map((professional) => (
        <div key={professional.id} className="rounded-3xl border border-line bg-card p-4">
          <p className="font-medium" style={{ color: professional.color }}>{professional.name}</p>
          <p className="text-sm text-muted">{professional.bio}</p>
          {professional.hasLogin ? <Badge tone="good">Tem acesso</Badge> : null}
        </div>
      ))}
    </div>
  )
}

type BusinessSettings = {
  business: {
    name: string
    slug: string
    phone: string | null
    email: string | null
    address: string | null
    description: string | null
    timezone: string
    primaryColor: string
    accentColor: string
    minAdvanceMinutes: number
    maxAdvanceDays: number
    cancelMinHours: number
    slotIntervalMinutes: number
    autoConfirm: boolean
    plan: { name: string; code: string; maxProfessionals: number; maxAppointmentsPerMonth: number }
  }
  workingHours: { weekday: number; startTime: string; endTime: string }[]
}

export function SettingsPage() {
  const membership = useMembership()
  const client = useQueryClient()
  const query = useQuery({
    queryKey: ['settings', membership?.business.id],
    queryFn: () => api<BusinessSettings>('/api/business'),
  })
  const [draft, setDraft] = useState<BusinessSettings['business'] | null>(null)
  const current = draft ?? query.data?.business
  const save = useMutation({
    mutationFn: () => api('/api/business', { method: 'PATCH', body: JSON.stringify(current) }),
    onSuccess: () => {
      toast.success('Configurações salvas')
      client.invalidateQueries({ queryKey: ['settings'] })
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Falha ao salvar'),
  })
  const hours = useMutation({
    mutationFn: (weekday: number) => {
      const existing = query.data?.workingHours ?? []
      const has = existing.some((item) => item.weekday === weekday)
      const next = has
        ? existing.filter((item) => item.weekday !== weekday)
        : [...existing, { weekday, startTime: '09:00', endTime: '18:00' }]
      return api('/api/working-hours', { method: 'PUT', body: JSON.stringify({ hours: next }) })
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['settings'] }),
  })
  if (!current) return <p>Carregando configurações…</p>
  return (
    <div className="grid gap-4">
      <h1 className="font-serif text-4xl">Configurações</h1>
      <Card>
        <p className="text-sm text-muted">Plano {current.plan.name}: até {current.plan.maxProfessionals} profissionais e {current.plan.maxAppointmentsPerMonth} agendamentos por mês. Cobrança ainda não está ligada.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Field label="Nome"><Input value={current.name} onChange={(event) => setDraft({ ...current, name: event.target.value })} /></Field>
          <Field label="Endereço público"><Input value={current.slug} onChange={(event) => setDraft({ ...current, slug: event.target.value })} /></Field>
          <Field label="Telefone"><Input value={current.phone ?? ''} onChange={(event) => setDraft({ ...current, phone: event.target.value })} /></Field>
          <Field label="E-mail"><Input value={current.email ?? ''} onChange={(event) => setDraft({ ...current, email: event.target.value })} /></Field>
          <Field label="Endereço"><Input value={current.address ?? ''} onChange={(event) => setDraft({ ...current, address: event.target.value })} /></Field>
          <Field label="Fuso"><Input value={current.timezone} onChange={(event) => setDraft({ ...current, timezone: event.target.value })} /></Field>
          <Field label="Cor principal"><Input value={current.primaryColor} onChange={(event) => setDraft({ ...current, primaryColor: event.target.value })} /></Field>
          <Field label="Cor de apoio"><Input value={current.accentColor} onChange={(event) => setDraft({ ...current, accentColor: event.target.value })} /></Field>
          <Field label="Antecedência mínima (min)"><Input value={current.minAdvanceMinutes} onChange={(event) => setDraft({ ...current, minAdvanceMinutes: Number(event.target.value) })} /></Field>
          <Field label="Antecedência máxima (dias)"><Input value={current.maxAdvanceDays} onChange={(event) => setDraft({ ...current, maxAdvanceDays: Number(event.target.value) })} /></Field>
          <Field label="Cancelamento até (horas)"><Input value={current.cancelMinHours} onChange={(event) => setDraft({ ...current, cancelMinHours: Number(event.target.value) })} /></Field>
          <Field label="Grade (min)"><Input value={current.slotIntervalMinutes} onChange={(event) => setDraft({ ...current, slotIntervalMinutes: Number(event.target.value) })} /></Field>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={current.autoConfirm} onChange={(event) => setDraft({ ...current, autoConfirm: event.target.checked })} />
          Confirmar agendamentos públicos automaticamente
        </label>
        <Button className="mt-4" onClick={() => save.mutate()} disabled={save.isPending}>Salvar</Button>
      </Card>
      <Card>
        <h2 className="font-serif text-2xl">Expediente</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map((weekday) => {
            const active = query.data?.workingHours.some((item) => item.weekday === weekday)
            return (
              <Button key={weekday} variant={active ? 'primary' : 'line'} onClick={() => hours.mutate(weekday)}>
                {weekdayLabel(weekday)}
              </Button>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

export function AuditPage() {
  const query = useQuery({
    queryKey: ['audit'],
    queryFn: () => api<{ data: { id: string; action: string; entityType: string; createdAt: string }[] }>('/api/audit'),
  })
  return (
    <div className="grid gap-3">
      <h1 className="font-serif text-4xl">Auditoria</h1>
      {query.data?.data.length === 0 ? (
        <Empty
          title="Sem eventos"
          text="As ações administrativas aparecem aqui."
          action={<Button asChild variant="line"><Link to="/app">Voltar ao painel</Link></Button>}
        />
      ) : null}
      {query.data?.data.map((item) => (
        <div key={item.id} className="rounded-2xl border border-line bg-card px-4 py-3 text-sm">
          <strong>{item.action}</strong>
          <p className="text-muted tabular-nums">{item.entityType} · {new Date(item.createdAt).toLocaleString('pt-BR')}</p>
        </div>
      ))}
    </div>
  )
}

function Pager({ page, total, pageSize, onPage }: { page: number; total: number; pageSize: number; onPage: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  if (pages <= 1) return null
  return (
    <div className="flex gap-2">
      <Button variant="line" disabled={page <= 1} onClick={() => onPage(page - 1)}>Anterior</Button>
      <span className="self-center text-sm">{page} / {pages}</span>
      <Button variant="line" disabled={page >= pages} onClick={() => onPage(page + 1)}>Próxima</Button>
    </div>
  )
}
