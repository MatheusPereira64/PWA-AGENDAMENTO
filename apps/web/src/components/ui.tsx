import * as Dialog from '@radix-ui/react-dialog'
import * as LabelPrimitive from '@radix-ui/react-label'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'
import { type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-pine text-paper hover:bg-pine-deep',
        ghost: 'bg-transparent text-ink hover:bg-white/70',
        danger: 'bg-danger text-white',
        line: 'border border-line bg-card text-ink hover:border-ink/20',
      },
    },
    defaultVariants: { variant: 'primary' },
  },
)

export function Button({
  className,
  variant,
  asChild,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant }), className)} {...props} />
}

export function Label({ className, ...props }: LabelPrimitive.LabelProps) {
  return <LabelPrimitive.Root className={cn('text-sm font-medium text-ink', className)} {...props} />
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-11 w-full rounded-2xl border border-line bg-card px-3 text-sm outline-none placeholder:text-muted',
        className,
      )}
      {...props}
    />
  )
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn('min-h-24 w-full rounded-2xl border border-line bg-card px-3 py-2 text-sm outline-none', className)}
      {...props}
    />
  )
}

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn('h-11 w-full rounded-2xl border border-line bg-card px-3 text-sm', className)}
      {...props}
    />
  )
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn('rounded-3xl border border-line bg-card p-5 shadow-[0_1px_0_rgba(18,38,31,0.04)]', className)}>{children}</section>
}

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'good' | 'warn' | 'bad' }) {
  const tones = {
    neutral: 'bg-paper text-ink',
    good: 'bg-pine/10 text-pine-deep',
    warn: 'bg-brass/20 text-ink',
    bad: 'bg-danger/10 text-danger',
  }
  return <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-medium', tones[tone])}>{children}</span>
}

export function Field({ label, children, error }: { label: string; children: ReactNode; error?: string }) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      {children}
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </label>
  )
}

export function Modal({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: ReactNode
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-[min(100%-1.5rem,36rem)] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-3xl bg-card p-5 shadow-xl">
          <div className="mb-4 flex items-start justify-between gap-4">
            <Dialog.Title className="font-serif text-2xl">{title}</Dialog.Title>
            <Dialog.Close className="rounded-full p-2 hover:bg-paper" aria-label="Fechar">
              <X size={18} />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-line px-4 py-10 text-center">
      <p className="font-serif text-2xl">{title}</p>
      <p className="mt-2 text-sm text-muted">{text}</p>
    </div>
  )
}

export function statusTone(status: string): 'neutral' | 'good' | 'warn' | 'bad' {
  if (status === 'CONFIRMED' || status === 'COMPLETED') return 'good'
  if (status === 'PENDING') return 'warn'
  if (status === 'CANCELLED' || status === 'NO_SHOW') return 'bad'
  return 'neutral'
}
