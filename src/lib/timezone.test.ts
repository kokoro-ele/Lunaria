import { describe, expect, it } from 'vitest'
import {
  localWallTimeToUtc,
  offsetLabel,
  timezoneFor,
  wallTimeAt,
} from './timezone'

describe('wallTimeAt', () => {
  it('formats the same instant in the selected time zone, including date changes', () => {
    const instant = new Date('2026-01-01T00:15:00Z')

    expect(wallTimeAt(instant, 'Pacific/Honolulu')).toEqual({
      date: '2025-12-31',
      time: '14:15',
    })
    expect(wallTimeAt(instant, 'Pacific/Kiritimati')).toEqual({
      date: '2026-01-01',
      time: '14:15',
    })
  })
})

describe('localWallTimeToUtc', () => {
  it('handles ordinary and non-whole-hour offsets', () => {
    expect(
      localWallTimeToUtc('2026-07-04', '12:00', 'America/New_York').toISOString(),
    ).toBe('2026-07-04T16:00:00.000Z')
    expect(
      localWallTimeToUtc('2026-01-15', '12:00', 'Asia/Kathmandu').toISOString(),
    ).toBe('2026-01-15T06:15:00.000Z')
  })

  it('moves a nonexistent spring-forward time ahead by the DST gap', () => {
    const result = localWallTimeToUtc(
      '2026-03-08',
      '02:30',
      'America/New_York',
    )

    expect(result.toISOString()).toBe('2026-03-08T07:30:00.000Z')
    expect(wallTimeAt(result, 'America/New_York')).toEqual({
      date: '2026-03-08',
      time: '03:30',
    })
  })

  it('uses the earlier instant during a fall-back overlap', () => {
    expect(
      localWallTimeToUtc('2026-11-01', '01:30', 'America/New_York').toISOString(),
    ).toBe('2026-11-01T05:30:00.000Z')
  })

  it('supports a 30-minute DST transition', () => {
    const result = localWallTimeToUtc(
      '2026-10-04',
      '02:15',
      'Australia/Lord_Howe',
    )

    expect(result.toISOString()).toBe('2026-10-03T15:45:00.000Z')
    expect(wallTimeAt(result, 'Australia/Lord_Howe')).toEqual({
      date: '2026-10-04',
      time: '02:45',
    })
  })

  it('rejects malformed or impossible calendar values', () => {
    expect(() => localWallTimeToUtc('2026-02-30', '12:00', 'UTC')).toThrow(
      RangeError,
    )
    expect(() => localWallTimeToUtc('2026-01-01', '24:00', 'UTC')).toThrow(
      RangeError,
    )
  })
})

describe('time-zone metadata', () => {
  it('resolves coordinates and formats offsets', () => {
    expect(timezoneFor(31.2304, 121.4737)).toBe('Asia/Shanghai')
    expect(offsetLabel(new Date('2026-01-01T00:00:00Z'), 'Asia/Shanghai')).toBe(
      'UTC+08:00',
    )
  })
})
