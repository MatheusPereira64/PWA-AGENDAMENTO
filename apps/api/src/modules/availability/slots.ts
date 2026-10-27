import { DateTime } from 'luxon'

export type BusyRange = { startsAt: Date; blockedUntil: Date }
export type TimeRange = { startsAt: Date; endsAt: Date }

export type WorkingHours = {
  startTime: string
  endTime: string
  breakStart?: string | null
  breakEnd?: string | null
}

export type Slot = {
  startsAt: string
  endsAt: string
  label: string
}

export type SlotDecision =
  | { ok: true; endsAt: Date; blockedUntil: Date }
  | { ok: false; reason: string }

function overlaps(startA: number, endA: number, startB: number, endB: number) {
  return startA < endB && startB < endA
}

function localDateTime(date: string, time: string, zone: string) {
  return DateTime.fromISO(`${date}T${time}`, { zone })
}

export function evaluateSlot(input: {
  timezone: string
  startsAt: Date
  durationMinutes: number
  bufferMinutes: number
  slotIntervalMinutes: number
  minAdvanceMinutes: number
  maxAdvanceDays: number
  now: Date
  workingHours: WorkingHours | null
  busy: BusyRange[]
  timeOff: TimeRange[]
}): SlotDecision {
  const zone = input.timezone
  const start = DateTime.fromJSDate(input.startsAt, { zone: 'utc' }).setZone(zone)
  if (!start.isValid) return { ok: false, reason: 'Data inválida' }

  const hours = input.workingHours
  if (!hours) return { ok: false, reason: 'O profissional não atende neste dia' }

  const date = start.toISODate()
  if (!date) return { ok: false, reason: 'Data inválida' }

  const open = localDateTime(date, hours.startTime, zone)
  const close = localDateTime(date, hours.endTime, zone)
  if (!open.isValid || !close.isValid || close <= open) {
    return { ok: false, reason: 'Expediente inválido' }
  }

  const offset = start.diff(open, 'minutes').minutes
  const roundedOffset = Math.round(offset)
  if (
    roundedOffset < 0 ||
    Math.abs(offset - roundedOffset) > 0.01 ||
    roundedOffset % input.slotIntervalMinutes !== 0
  ) {
    return { ok: false, reason: 'O horário não faz parte da grade de atendimento' }
  }

  const ends = start.plus({ minutes: input.durationMinutes })
  const blocked = ends.plus({ minutes: input.bufferMinutes })
  if (ends.toMillis() > close.toMillis()) {
    return { ok: false, reason: 'O atendimento ultrapassa o fim do expediente' }
  }

  const now = DateTime.fromJSDate(input.now, { zone: 'utc' }).setZone(zone)
  if (start.toMillis() < now.plus({ minutes: input.minAdvanceMinutes }).toMillis()) {
    return { ok: false, reason: 'O horário não respeita a antecedência mínima' }
  }
  if (start.toMillis() > now.plus({ days: input.maxAdvanceDays }).toMillis()) {
    return { ok: false, reason: 'O horário está além da antecedência máxima' }
  }

  const startMs = start.toUTC().toMillis()
  const blockedMs = blocked.toUTC().toMillis()

  if (hours.breakStart && hours.breakEnd) {
    const breakStart = localDateTime(date, hours.breakStart, zone).toUTC().toMillis()
    const breakEnd = localDateTime(date, hours.breakEnd, zone).toUTC().toMillis()
    if (overlaps(startMs, blockedMs, breakStart, breakEnd)) {
      return { ok: false, reason: 'O horário invade o intervalo' }
    }
  }

  const busy = input.busy.some((item) =>
    overlaps(startMs, blockedMs, item.startsAt.getTime(), item.blockedUntil.getTime()),
  )
  if (busy) return { ok: false, reason: 'O horário já está ocupado' }

  const off = input.timeOff.some((item) =>
    overlaps(startMs, blockedMs, item.startsAt.getTime(), item.endsAt.getTime()),
  )
  if (off) return { ok: false, reason: 'O horário está bloqueado' }

  return {
    ok: true,
    endsAt: ends.toUTC().toJSDate(),
    blockedUntil: blocked.toUTC().toJSDate(),
  }
}

export function buildSlots(input: {
  timezone: string
  date: string
  durationMinutes: number
  bufferMinutes: number
  slotIntervalMinutes: number
  minAdvanceMinutes: number
  maxAdvanceDays: number
  now: Date
  workingHours: WorkingHours | null
  busy: BusyRange[]
  timeOff: TimeRange[]
}): Slot[] {
  if (!input.workingHours) return []
  const open = localDateTime(input.date, input.workingHours.startTime, input.timezone)
  const close = localDateTime(input.date, input.workingHours.endTime, input.timezone)
  if (!open.isValid || !close.isValid) return []

  const slots: Slot[] = []
  for (let cursor = open; cursor < close; cursor = cursor.plus({ minutes: input.slotIntervalMinutes })) {
    const decision = evaluateSlot({ ...input, startsAt: cursor.toUTC().toJSDate() })
    if (!decision.ok) continue
    const startsAt = cursor.toUTC().toISO()
    const endsAt = DateTime.fromJSDate(decision.endsAt, { zone: 'utc' }).toISO()
    if (!startsAt || !endsAt) continue
    slots.push({
      startsAt,
      endsAt,
      label: cursor.toFormat('HH:mm'),
    })
  }
  return slots
}

export function resolveWorkingHours(
  professionalHours: (WorkingHours & { weekday: number })[],
  businessHours: { startTime: string; endTime: string } | null,
  weekday: number,
): WorkingHours | null {
  if (professionalHours.length === 0) {
    return businessHours
      ? { startTime: businessHours.startTime, endTime: businessHours.endTime }
      : null
  }
  const own = professionalHours.find((item) => item.weekday === weekday)
  if (!own) return null
  return {
    startTime: own.startTime,
    endTime: own.endTime,
    breakStart: own.breakStart,
    breakEnd: own.breakEnd,
  }
}

export function mergeSlots(groups: { professionalId: string; slots: Slot[] }[]) {
  const map = new Map<string, Slot & { professionalIds: string[] }>()
  for (const group of groups) {
    for (const slot of group.slots) {
      const current = map.get(slot.startsAt)
      if (current) current.professionalIds.push(group.professionalId)
      else map.set(slot.startsAt, { ...slot, professionalIds: [group.professionalId] })
    }
  }
  return [...map.values()].sort((left, right) => left.startsAt.localeCompare(right.startsAt))
}
