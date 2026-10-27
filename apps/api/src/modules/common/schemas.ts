import { emailSchema, passwordSchema, phoneSchema, slugSchema, timeSchema } from '@mp-agenda/shared'

export { emailSchema, passwordSchema, phoneSchema, slugSchema, timeSchema }
import { z } from 'zod'

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120),
    email: emailSchema,
    password: passwordSchema,
    businessName: z.string().trim().min(2).max(120),
    slug: slugSchema,
    phone: phoneSchema.optional(),
    timezone: z.string().trim().min(1).max(80).optional(),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
})

export const registerCustomerSchema = z.object({
  body: z.object({
    businessSlug: slugSchema,
    name: z.string().trim().min(2).max(120),
    email: emailSchema,
    password: passwordSchema,
    phone: phoneSchema,
  }),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
})

export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string().min(1).max(200),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
})

export const forgotSchema = z.object({
  body: z.object({ email: emailSchema }),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
})

export const resetSchema = z.object({
  body: z.object({
    token: z.string().min(20).max(500),
    password: passwordSchema,
  }),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
})

export const customerInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: phoneSchema,
  email: emailSchema.optional(),
  notes: z.string().trim().max(2000).optional(),
})

export const priceSchema = z.union([z.string(), z.number()]).transform((value, ctx) => {
  const numeric = typeof value === 'number' ? value : Number(value.replace(',', '.'))
  if (!Number.isFinite(numeric) || numeric <= 0 || numeric > 100000) {
    ctx.addIssue({ code: 'custom', message: 'Preço inválido' })
    return z.NEVER
  }
  return numeric.toFixed(2)
})

export const workingHourSchema = z
  .object({
    weekday: z.number().int().min(1).max(7),
    startTime: timeSchema,
    endTime: timeSchema,
    breakStart: timeSchema.nullable().optional(),
    breakEnd: timeSchema.nullable().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.startTime >= value.endTime) {
      ctx.addIssue({ code: 'custom', message: 'O início precisa ser antes do fim', path: ['endTime'] })
    }
    const hasBreak = Boolean(value.breakStart || value.breakEnd)
    if (hasBreak && (!value.breakStart || !value.breakEnd)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Informe início e fim do intervalo',
        path: ['breakStart'],
      })
    }
    if (
      value.breakStart &&
      value.breakEnd &&
      (value.breakStart >= value.breakEnd ||
        value.breakStart < value.startTime ||
        value.breakEnd > value.endTime)
    ) {
      ctx.addIssue({ code: 'custom', message: 'Intervalo fora do expediente', path: ['breakStart'] })
    }
  })

export const hoursListSchema = z
  .array(workingHourSchema)
  .max(7)
  .superRefine((hours, ctx) => {
    const days = new Set(hours.map((item) => item.weekday))
    if (days.size !== hours.length) {
      ctx.addIssue({ code: 'custom', message: 'Há dias repetidos no expediente' })
    }
  })

export const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida')

export const instantSchema = z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Data inválida')

export const pageQuerySchema = {
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
  q: z.string().trim().max(120).optional(),
}
