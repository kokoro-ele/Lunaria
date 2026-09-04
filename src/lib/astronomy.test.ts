import { describe, expect, it } from 'vitest'
import { computeMoonView, phaseKeyFromEcliptic } from './astronomy'

describe('phaseKeyFromEcliptic', () => {
  it('classifies all eight lunar phase ranges and wraps angles', () => {
    expect(phaseKeyFromEcliptic(0)).toBe('new')
    expect(phaseKeyFromEcliptic(45)).toBe('waxingCrescent')
    expect(phaseKeyFromEcliptic(90)).toBe('firstQuarter')
    expect(phaseKeyFromEcliptic(135)).toBe('waxingGibbous')
    expect(phaseKeyFromEcliptic(180)).toBe('full')
    expect(phaseKeyFromEcliptic(225)).toBe('waningGibbous')
    expect(phaseKeyFromEcliptic(270)).toBe('lastQuarter')
    expect(phaseKeyFromEcliptic(315)).toBe('waningCrescent')
    expect(phaseKeyFromEcliptic(360)).toBe('new')
    expect(phaseKeyFromEcliptic(-45)).toBe('waningCrescent')
  })
})

describe('computeMoonView', () => {
  it('returns physically bounded values and a normalized Sun direction', () => {
    const view = computeMoonView(
      new Date('2026-09-05T04:00:00Z'),
      31.2304,
      121.4737,
    )

    expect(view.illumination).toBeGreaterThanOrEqual(0)
    expect(view.illumination).toBeLessThanOrEqual(1)
    expect(view.phaseAngle).toBeGreaterThanOrEqual(0)
    expect(view.phaseAngle).toBeLessThanOrEqual(180)
    expect(view.distanceKm).toBeGreaterThan(350_000)
    expect(view.distanceKm).toBeLessThan(410_000)
    expect(view.altitude).toBeGreaterThanOrEqual(-90)
    expect(view.altitude).toBeLessThanOrEqual(90)
    expect(Math.hypot(...view.sunDir)).toBeCloseTo(1, 10)
  })
})
