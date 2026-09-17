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

export async function searchLocations(
  query: string,
  language: string,
  signal: AbortSignal,
): Promise<LocationResult[]> {
  if (Array.from(query.trim()).length < 2) return []
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search')
  url.search = new URLSearchParams({
    name: query.trim(), language, count: '8', format: 'json',
  }).toString()
  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error('Location search failed')
  const data = await response.json()
  if (data.error || (data.results !== undefined && !Array.isArray(data.results))) {
    throw new Error('Invalid location response')
  }
  return normalizeLocations((data.results ?? []).filter((place: LocationResult) =>
    place && Number.isFinite(place.id) && typeof place.name === 'string' &&
    Number.isFinite(place.latitude) && Math.abs(place.latitude) <= 90 &&
    Number.isFinite(place.longitude) && Math.abs(place.longitude) <= 180,
  ))
}
