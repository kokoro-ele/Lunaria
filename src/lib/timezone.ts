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

/**
 * Offset (in minutes) of `timeZone` from UTC at the given instant.
 * Positive means ahead of UTC (e.g. +480 for Asia/Shanghai).
 */
function tzOffsetMinutes(date: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  const parts = dtf.formatToParts(date)
  const map: Record<string, number> = {}
  for (const p of parts) {
    if (p.type !== 'literal') map[p.type] = Number(p.value)
  }
  // Time the wall clock shows in `timeZone` for this instant, as if it were UTC.
  const asUtc = Date.UTC(
    map.year,
    map.month - 1,
    map.day,
    map.hour === 24 ? 0 : map.hour,
    map.minute,
    map.second,
  )
  return Math.round((asUtc - date.getTime()) / 60000)
}

/**
 * Convert a wall-clock date/time *at the selected location* into the absolute
 * UTC instant it represents. Handles DST via Intl with a single refinement
 * pass (sufficient for everything except the ~1h DST fold ambiguity).
 */
export function localWallTimeToUtc(
  dateStr: string,
  timeStr: string,
  timeZone: string,
): Date {
  const [y, mo, d] = dateStr.split('-').map(Number)
  const [h, mi] = timeStr.split(':').map(Number)
  // First guess: treat the wall time as if it were UTC.
  const guessUtcMs = Date.UTC(y, mo - 1, d, h, mi, 0)
  let offset = tzOffsetMinutes(new Date(guessUtcMs), timeZone)
  let resultMs = guessUtcMs - offset * 60000
  // Refine once in case the offset near the boundary changed.
  const offset2 = tzOffsetMinutes(new Date(resultMs), timeZone)
  if (offset2 !== offset) {
    offset = offset2
    resultMs = guessUtcMs - offset * 60000
  }
  return new Date(resultMs)
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
