export interface LocationResult {
  id: number
  name: string
  latitude: number
  longitude: number
  population?: number
  feature_code?: string
  admin2?: string
  admin3?: string
  admin4?: string
  admin1?: string
  country?: string
}

export function locationDescription(place: LocationResult): string {
  return [...new Set([place.admin4, place.admin3, place.admin2, place.admin1, place.country].filter((part) => part && part !== place.name))].join(' · ')
}

export function normalizeLocations(places: LocationResult[]): LocationResult[] {
  const ids = new Set<number>()
  const coordinates = new Set<string>()
  return places.filter((place) => {
    const key = `${place.name}|${place.latitude}|${place.longitude}`
    if (ids.has(place.id) || coordinates.has(key)) return false
    ids.add(place.id)
    coordinates.add(key)
    return true
  }).sort((a, b) => {
    const major = (place: LocationResult) => /^PPL(C|A[2-5]?)$/.test(place.feature_code ?? '') ? 1 : 0
    return major(b) - major(a) || (b.population ?? 0) - (a.population ?? 0)
  })
}

async function fetchLocations(
  name: string,
  language: string,
  signal: AbortSignal,
): Promise<LocationResult[]> {
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search')
  url.search = new URLSearchParams({ name, language, count: '8', format: 'json' }).toString()
  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error('Location search failed')
  const data = await response.json()
  if (data.error || (data.results !== undefined && !Array.isArray(data.results))) {
    throw new Error('Invalid location response')
  }
  return (data.results ?? []).filter((place: LocationResult) =>
    place && Number.isFinite(place.id) && typeof place.name === 'string' &&
    Number.isFinite(place.latitude) && Math.abs(place.latitude) <= 90 &&
    Number.isFinite(place.longitude) && Math.abs(place.longitude) <= 180,
  )
}

export async function searchLocations(
  query: string,
  language: string,
  signal: AbortSignal,
): Promise<LocationResult[]> {
  const name = query.trim()
  if (Array.from(name).length < 2) return []
  const names = [name]
  // Two-character queries are exact matches upstream. Some cities are indexed
  // only with 市 (泰州市), others without it. Search both without transliteration.
  if (/^\p{Script=Han}{2,}$/u.test(name)) {
    if (name.endsWith('市') && name.length > 2) names.push(name.slice(0, -1))
    else if (!/[省县区州盟旗镇乡村]$/.test(name) || name.endsWith('州')) names.push(`${name}市`)
  }
  const responses = await Promise.allSettled(names.map((candidate) => fetchLocations(candidate, language, signal)))
  if (signal.aborted) throw new DOMException('Search cancelled', 'AbortError')
  const places = responses.flatMap((response) => response.status === 'fulfilled' ? response.value : [])
  // Keep useful matches if one variant fails, but never disguise a partial
  // service failure as an authoritative "no results" response.
  const failure = responses.find((response) => response.status === 'rejected')
  if (!places.length && failure?.status === 'rejected') throw failure.reason
  return normalizeLocations(places)
}
