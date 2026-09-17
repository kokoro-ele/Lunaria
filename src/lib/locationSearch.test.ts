import { afterEach, describe, expect, it, vi } from 'vitest'
import { locationDescription, normalizeLocations, searchLocations } from './locationSearch'

afterEach(() => vi.unstubAllGlobals())

describe('location search', () => {
  it('preserves Chinese queries and language and passes cancellation through', async () => {
    const place = { id: 1, name: '上海', latitude: 31.23, longitude: 121.47 }
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ results: [place, { ...place, latitude: 100 }] }) })
    vi.stubGlobal('fetch', fetchMock)
    const signal = new AbortController().signal
    expect(await searchLocations(' 上海 ', 'zh', signal)).toEqual([place])
    const [url, options] = fetchMock.mock.calls[0]
    expect(url.searchParams.get('name')).toBe('上海')
    expect(url.searchParams.get('language')).toBe('zh')
    expect(options.signal).toBe(signal)
  })

  it('does not request incomplete queries and handles no matches', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) })
    vi.stubGlobal('fetch', fetchMock)
    const signal = new AbortController().signal
    expect(await searchLocations(' ', 'en', signal)).toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()
    expect(await searchLocations('Unknown place', 'en', signal)).toEqual([])
  })

  it('rejects service errors instead of treating them as no matches', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    await expect(searchLocations('London', 'en', new AbortController().signal)).rejects.toThrow()
  })
})


describe('same-name locations', () => {
  const city = { id: 1799962, name: '南京', latitude: 32.06167, longitude: 118.77778, admin1: '江苏', admin2: '南京', country: '中国', feature_code: 'PPLA' }
  const lincang = { id: 9924292, name: '南京', latitude: 23.4071, longitude: 99.7757, admin1: '云南', admin2: '临沧市', country: '中国', feature_code: 'PPL' }
  const simao = { ...lincang, id: 9931976, latitude: 23.7873, longitude: 101.084, admin2: '思茅市' }

  it('distinguishes same-name places by their administrative areas', () => {
    expect(locationDescription(city)).toBe('江苏 · 中国')
    expect(locationDescription(lincang)).toBe('临沧市 · 云南 · 中国')
    expect(locationDescription(simao)).toBe('思茅市 · 云南 · 中国')
  })

  it('prioritizes administrative seats and deduplicates without merging distinct places', () => {
    expect(normalizeLocations([lincang, simao, city, city, { ...lincang, id: 123 }])).toEqual([city, lincang, simao])
  })
})
