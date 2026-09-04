// @ts-expect-error - tz-lookup ships without bundled types
import tzlookup from 'tz-lookup'

/** Resolve an IANA timezone name from coordinates. */
export function timezoneFor(latitude: number, longitude: number): string {
  try {
    return tzlookup(latitude, longitude)
  } catch {
    return 'UTC'
  }
}

interface ZonedDateTimeParts {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

export interface WallTime {
  /** Calendar date in YYYY-MM-DD format. */
  date: string
  /** Wall-clock time in HH:mm format. */
  time: string
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function zonedParts(date: Date, timeZone: string): ZonedDateTimeParts {
  const dtf = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  const values: Record<string, number> = {}
  for (const part of dtf.formatToParts(date)) {
    if (part.type !== 'literal') values[part.type] = Number(part.value)
  }

  return {
    year: values.year,
    month: values.month,
    day: values.day,
    // `hourCycle: h23` prevents 24:00 in modern engines; modulo keeps older
    // implementations from turning midnight into a one-day offset.
    hour: values.hour % 24,
    minute: values.minute,
    second: values.second,
  }
}

/** Format an absolute instant as the date and wall-clock time at a location. */
export function wallTimeAt(date: Date, timeZone: string): WallTime {
  const parts = zonedParts(date, timeZone)
  return {
    date: `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`,
    time: `${pad(parts.hour)}:${pad(parts.minute)}`,
  }
}

/**
 * Offset (in minutes) of `timeZone` from UTC at the given instant.
 * Positive means ahead of UTC (e.g. +480 for Asia/Shanghai).
 */
function tzOffsetMinutes(date: Date, timeZone: string): number {
  const parts = zonedParts(date, timeZone)
  // Time the wall clock shows in `timeZone` for this instant, as if it were UTC.
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  )
  return Math.round((asUtc - date.getTime()) / 60000)
}

function sameWallTime(a: ZonedDateTimeParts, b: ZonedDateTimeParts): boolean {
  return (
    a.year === b.year &&
    a.month === b.month &&
    a.day === b.day &&
    a.hour === b.hour &&
    a.minute === b.minute
  )
}

function parseWallTime(dateStr: string, timeStr: string): ZonedDateTimeParts {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr)
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(timeStr)
  if (!match || !timeMatch) throw new RangeError('Invalid local date or time')

  const parts: ZonedDateTimeParts = {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(timeMatch[1]),
    minute: Number(timeMatch[2]),
    second: 0,
  }
  const check = new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute),
  )
  if (
    parts.hour > 23 ||
    parts.minute > 59 ||
    check.getUTCFullYear() !== parts.year ||
    check.getUTCMonth() !== parts.month - 1 ||
    check.getUTCDate() !== parts.day
  ) {
    throw new RangeError('Invalid local date or time')
  }
  return parts
}

/**
 * Convert a wall-clock date/time *at the selected location* into the absolute
 * UTC instant it represents. During a DST overlap the earlier instant is used;
 * a nonexistent time in a spring-forward gap is moved forward by the gap. This
 * matches the "compatible" disambiguation used by Temporal and legacy Date.
 */
export function localWallTimeToUtc(
  dateStr: string,
  timeStr: string,
  timeZone: string,
): Date {
  const requested = parseWallTime(dateStr, timeStr)
  const wallTimeAsUtc = Date.UTC(
    requested.year,
    requested.month - 1,
    requested.day,
    requested.hour,
    requested.minute,
  )

  // Gather every offset that can plausibly apply around the requested date.
  // Testing each one resolves ordinary times and both sides of a DST overlap.
  const offsets = new Set<number>()
  for (let hours = -36; hours <= 36; hours += 6) {
    offsets.add(tzOffsetMinutes(new Date(wallTimeAsUtc + hours * 3600000), timeZone))
  }
  const matches = [...offsets]
    .map((offset) => new Date(wallTimeAsUtc - offset * 60000))
    .filter((candidate) => sameWallTime(zonedParts(candidate, timeZone), requested))
    .sort((a, b) => a.getTime() - b.getTime())

  if (matches.length > 0) return matches[0]

  // No matching instant means the local clock time lies in a forward DST gap.
  // Applying the pre-transition offset moves it forward by exactly that gap.
  const preTransitionOffset = tzOffsetMinutes(
    new Date(wallTimeAsUtc - 36 * 3600000),
    timeZone,
  )
  return new Date(wallTimeAsUtc - preTransitionOffset * 60000)
}

/** Human-readable UTC offset label like "UTC+08:00". */
export function offsetLabel(date: Date, timeZone: string): string {
  const off = tzOffsetMinutes(date, timeZone)
  const sign = off >= 0 ? '+' : '-'
  const abs = Math.abs(off)
  const hh = String(Math.floor(abs / 60)).padStart(2, '0')
  const mm = String(abs % 60).padStart(2, '0')
  return `UTC${sign}${hh}:${mm}`
}
