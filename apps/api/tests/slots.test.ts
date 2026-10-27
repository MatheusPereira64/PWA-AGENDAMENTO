import { DateTime } from 'luxon'
import { describe, expect, it } from 'vitest'
import { buildSlots, evaluateSlot } from '../src/modules/availability/slots.js'

const hours = { startTime: '09:00', endTime: '18:00', breakStart: '12:00', breakEnd: '13:00' }
const base = {
  timezone: 'America/Sao_Paulo',
  durationMinutes: 60,
  bufferMinutes: 10,
  slotIntervalMinutes: 30,
  minAdvanceMinutes: 60,
  maxAdvanceDays: 30,
  now: new Date('2026-10-27T12:00:00.000Z'),
  workingHours: hours,
  busy: [],
  timeOff: [],
}

describe('disponibilidade', () => {
  it('omite almoço, expediente encerrado e horários ocupados', () => {
    const slots = buildSlots({ ...base, date: '2026-10-28' })
    const labels = slots.map((slot) => slot.label)
    expect(labels).toContain('09:00')
    expect(labels).not.toContain('12:00')
    expect(labels).not.toContain('11:30')
    expect(labels).not.toContain('17:30')

    const occupied = buildSlots({
      ...base,
      date: '2026-10-28',
      busy: [
        {
          startsAt: new Date('2026-10-28T12:00:00.000Z'),
          blockedUntil: new Date('2026-10-28T13:10:00.000Z'),
        },
      ],
    })
    expect(occupied.map((slot) => slot.label)).not.toContain('09:00')
  })

  it('recusa antecedência insuficiente e folga', () => {
    const soon = evaluateSlot({
      ...base,
      startsAt: new Date('2026-10-27T12:30:00.000Z'),
    })
    expect(soon.ok).toBe(false)

    const off = evaluateSlot({
      ...base,
      startsAt: DateTime.fromISO('2026-10-28T09:00', { zone: 'America/Sao_Paulo' }).toUTC().toJSDate(),
      timeOff: [
        {
          startsAt: new Date('2026-10-28T11:00:00.000Z'),
          endsAt: new Date('2026-10-28T15:00:00.000Z'),
        },
      ],
    })
    expect(off.ok).toBe(false)
    if (!off.ok) expect(off.reason).toMatch(/bloqueado/i)
  })
})
