import { describe, expect, it } from 'vitest'
import { buildShareUrl, parseShareState } from './shareUrl'

describe('shareable view URLs', () => {
  it('serializes a stable, compact result link', () => {
    expect(
      buildShareUrl(
        {
          date: '1990-07-20',
          time: '21:15',
          latitude: 31.230416,
          longitude: 121.473701,
          tiltCorrection: true,
          language: 'zh',
        },
        'https://lunaria.timeblind.xyz/?old=1#moon',
      ),
    ).toBe(
      'https://lunaria.timeblind.xyz/?date=1990-07-20&time=21%3A15&lat=31.2304&lon=121.4737&view=local&lang=zh',
    )
  })

  it('restores valid fields and ignores malformed input', () => {
    expect(
      parseShareState('?date=2024-02-29&time=06%3A05&lat=-33.8688&lon=151.2093&view=free&lang=en'),
    ).toEqual({
      date: '2024-02-29',
      time: '06:05',
      latitude: -33.8688,
      longitude: 151.2093,
      tiltCorrection: false,
      language: 'en',
    })

    expect(parseShareState('?date=2023-02-29&time=25:00&lat=91&lon=181&lang=fr')).toEqual({})
  })
})
