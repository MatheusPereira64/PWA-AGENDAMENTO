import { zodResolver } from '@hookform/resolvers/zod'
import { useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { OfflineBanner } from '@/components/offline-banner'
import { Button, Field, Input } from '@/components/ui'
import { api, ApiError } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { useOnline } from '@/components/offline-banner'

function Brand() {
  return (
    <Link to="/" className="font-serif text-2xl">
      MP Agenda
    </Link>
  )
}

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <OfflineBanner />
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <Brand />
        <div className="flex gap-2">
          <Button asChild variant="ghost">
            <Link to="/entrar">Entrar</Link>
          </Button>
          <Button asChild>
            <Link to="/cadastrar">Criar conta</Link>
          </Button>
        </div>
      </header>
      <main className="mx-auto grid max-w-6xl gap-10 px-4 py-8 md:grid-cols-[1.2fr_0.8fr] md:py-16">
        <div>
          <p className="text-sm tracking-[0.16em] text-pine uppercase">MP Software</p>
          <h1 className="mt-3 font-serif text-5xl leading-tight md:text-6xl">
            A agenda do seu negócio, sem caderno e sem horário duplicado.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted">
            Salões, barbearias, clínicas e autônomos publicam uma página, mostram só os horários livres e acompanham o dia em um painel simples.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/b/studio-aurora">Ver demonstração</Link>
            </Button>
            <Button asChild variant="line">
              <Link to="/cadastrar">Começar grátis</Link>
            </Button>
          </div>
        </div>
        <aside className="rounded-[2rem] bg-ink p-6 text-paper">
          <p className="text-brass">Studio Aurora</p>
          <p className="mt-3 font-serif text-3xl">Corte às 15h, sem duas pessoas no mesmo horário.</p>
          <ul className="mt-6 space-y-3 text-sm text-paper/80">
            <li>Página pública com a cara do negócio</li>
            <li>Expediente, intervalo, folga e antecedência</li>
            <li>Painel com receita estimada de verdade</li>
            <li>Funciona no celular e pode ser instalado</li>
          </ul>
        </aside>
      </main>
    </div>
  )
}

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Informe a senha'),
})

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const online = useOnline()
  const [error, setError] = useState<string>()
  const form = useForm<z.infer<typeof loginSchema>>({ resolver: zodResolver(loginSchema) })

  return (
    <AuthFrame title="Entrar" subtitle="Use a conta do negócio ou a demonstração.">
      <form
        className="grid gap-4"
        onSubmit={form.handleSubmit(async (values) => {
          setError(undefined)
          try {
            await login(values.email, values.password)
            navigate('/app')
          } catch (caught) {
            setError(caught instanceof ApiError ? caught.message : 'Falha no login')
          }
        })}
      >
        <Field label="E-mail" error={form.formState.errors.email?.message}>
          <Input type="email" autoComplete="username" {...form.register('email')} />
        </Field>
        <Field label="Senha" error={form.formState.errors.password?.message}>
          <Input type="password" autoComplete="current-password" {...form.register('password')} />
        </Field>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        {!online ? <p className="text-sm text-danger">Sem conexão. O login não pode ser enviado.</p> : null}
        <Button type="submit" disabled={!online || form.formState.isSubmitting}>
          Entrar
        </Button>
      </form>
      <p className="mt-4 text-sm text-muted">
        <Link to="/recuperar-senha">Esqueci a senha</Link>
      </p>
      <div className="mt-6 rounded-2xl bg-paper p-3 text-sm">
        <p className="font-medium">Demonstração</p>
        <p>admin@studioaurora.example.com · Aurora#2026</p>
        <p>marina@studioaurora.example.com · Marina#2026</p>
        <p>cliente@studioaurora.example.com · Cliente#2026</p>
      </div>
    </AuthFrame>
  )
}

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  businessName: z.string().min(2),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  phone: z.string().min(10),
})

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const online = useOnline()
  const [error, setError] = useState<string>()
  const form = useForm<z.infer<typeof registerSchema>>({ resolver: zodResolver(registerSchema) })

  return (
    <AuthFrame title="Criar o negócio" subtitle="Você entra como administrador.">
      <form
        className="grid gap-4"
        onSubmit={form.handleSubmit(async (values) => {
          setError(undefined)
          try {
            await register(values)
            navigate('/app')
          } catch (caught) {
            setError(caught instanceof ApiError ? caught.message : 'Não foi possível cadastrar')
          }
        })}
      >
        <Field label="Seu nome"><Input {...form.register('name')} /></Field>
        <Field label="E-mail"><Input type="email" {...form.register('email')} /></Field>
        <Field label="Senha"><Input type="password" {...form.register('password')} /></Field>
        <Field label="Nome do negócio"><Input {...form.register('businessName')} onBlur={(event) => {
          if (!form.getValues('slug')) {
            form.setValue('slug', event.target.value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
          }
        }} /></Field>
        <Field label="Endereço público"><Input {...form.register('slug')} placeholder="estudio-luna" /></Field>
        <Field label="Telefone"><Input {...form.register('phone')} /></Field>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button type="submit" disabled={!online || form.formState.isSubmitting}>Criar conta</Button>
      </form>
    </AuthFrame>
  )
}

export function ForgotPasswordPage() {
  const online = useOnline()
  const [message, setMessage] = useState<string>()
  const [error, setError] = useState<string>()
  const form = useForm<{ email: string }>({ resolver: zodResolver(z.object({ email: z.string().email() })) })
  return (
    <AuthFrame title="Recuperar senha" subtitle="O link só é enviado se o e-mail transacional estiver configurado.">
      <form
        className="grid gap-4"
        onSubmit={form.handleSubmit(async (values) => {
          setError(undefined)
          try {
            const result = await api<{ message: string }>('/api/auth/forgot-password', {
              method: 'POST',
              body: JSON.stringify(values),
              business: false,
            })
            setMessage(result.message)
          } catch (caught) {
            setError(caught instanceof ApiError ? caught.message : 'Falha ao solicitar')
          }
        })}
      >
        <Field label="E-mail"><Input type="email" {...form.register('email')} /></Field>
        {message ? <p className="text-sm">{message}</p> : null}
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button type="submit" disabled={!online}>Enviar instruções</Button>
      </form>
    </AuthFrame>
  )
}

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [error, setError] = useState<string>()
  const form = useForm<{ password: string }>({ resolver: zodResolver(z.object({ password: z.string().min(8) })) })
  return (
    <AuthFrame title="Nova senha" subtitle="Use o link recebido por e-mail.">
      <form
        className="grid gap-4"
        onSubmit={form.handleSubmit(async (values) => {
          try {
            await api('/api/auth/reset-password', {
              method: 'POST',
              business: false,
              body: JSON.stringify({ token: params.get('token'), password: values.password }),
            })
            navigate('/entrar')
          } catch (caught) {
            setError(caught instanceof ApiError ? caught.message : 'Link inválido')
          }
        })}
      >
        <Field label="Nova senha"><Input type="password" {...form.register('password')} /></Field>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button type="submit">Salvar senha</Button>
      </form>
    </AuthFrame>
  )
}

function AuthFrame({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <OfflineBanner />
      <main className="mx-auto grid min-h-screen max-w-md content-center px-4 py-10">
        <Brand />
        <h1 className="mt-6 font-serif text-4xl">{title}</h1>
        <p className="mt-2 mb-6 text-muted">{subtitle}</p>
        {children}
      </main>
    </div>
  )
}
