import * as Astronomy from 'astronomy-engine'

const DEG = Math.PI / 180

export type PhaseKey =
  | 'new'
  | 'waxingCrescent'
  | 'firstQuarter'
  | 'waxingGibbous'
  | 'full'
  | 'waningGibbous'
  | 'lastQuarter'
  | 'waningCrescent'

export interface MoonView {
  /** Illuminated fraction 0..1 */
  illumination: number
  /** Phase angle Sun-Moon-Earth, degrees (0 = full, 180 = new) */
  phaseAngle: number
  /** Ecliptic phase 0..360 (0 = new, 180 = full) */
  eclipticPhase: number
  phaseKey: PhaseKey
  /** Moon age in days since previous new moon */
  ageDays: number
  /** Earth-Moon distance in km */
  distanceKm: number
  /** Libration in longitude / latitude (degrees) */
  libLon: number
  libLat: number
  /**
   * Unit direction (in the screen/scene frame, +X right, +Y up = local zenith,
   * +Z toward the observer) pointing from the Moon toward the Sun. Drives the
   * directional light so the terminator matches reality for this place & time.
   */
  sunDir: [number, number, number]
  /**
   * Rotation (radians) to apply about the view axis so the Moon's surface
   * features tilt as an observer at this location would actually see them
   * (parallactic angle). 0 when the Moon is below the horizon reference.
   */
  axisTilt: number
  /** Topocentric altitude of the Moon (degrees); negative = below horizon */
  altitude: number
  azimuth: number
}

function vecFromAzAlt(azDeg: number, altDeg: number): [number, number, number] {
  // ENU frame: East, North, Up. Azimuth measured from North, clockwise to East.
  const a = azDeg * DEG
  const h = altDeg * DEG
  const cosH = Math.cos(h)
  return [cosH * Math.sin(a), cosH * Math.cos(a), Math.sin(h)]
}

function dot(a: number[], b: number[]) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}
function cross(a: number[], b: number[]): [number, number, number] {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ]
}
function norm(a: number[]): [number, number, number] {
  const m = Math.hypot(a[0], a[1], a[2]) || 1
  return [a[0] / m, a[1] / m, a[2] / m]
}

export function phaseKeyFromEcliptic(p: number): PhaseKey {
  const a = ((p % 360) + 360) % 360
  if (a < 22.5 || a >= 337.5) return 'new'
  if (a < 67.5) return 'waxingCrescent'
  if (a < 112.5) return 'firstQuarter'
  if (a < 157.5) return 'waxingGibbous'
  if (a < 202.5) return 'full'
  if (a < 247.5) return 'waningGibbous'
  if (a < 292.5) return 'lastQuarter'
  return 'waningCrescent'
}

/**
 * Compute everything needed to render & describe the Moon for a given absolute
 * instant (UTC Date) as seen from an observer at latitude/longitude.
 */
export function computeMoonView(
  dateUtc: Date,
  latitude: number,
  longitude: number,
): MoonView {
  const observer = new Astronomy.Observer(latitude, longitude, 0)

  const illum = Astronomy.Illumination(Astronomy.Body.Moon, dateUtc)
  const eclipticPhase = Astronomy.MoonPhase(dateUtc)
  const lib = Astronomy.Libration(dateUtc)

  // Moon age: time since previous new moon.
  let ageDays = (eclipticPhase / 360) * 29.530588
  try {
    const prevNew = Astronomy.SearchMoonPhase(0, dateUtc, -40)
    if (prevNew) {
      ageDays = (dateUtc.getTime() - prevNew.date.getTime()) / 86400000
    }
  } catch {
    /* fall back to approximation */
  }

  // Topocentric equatorial -> horizontal for Moon and Sun.
  const moonEq = Astronomy.Equator(
    Astronomy.Body.Moon,
    dateUtc,
    observer,
    true,
    true,
  )
  const sunEq = Astronomy.Equator(
    Astronomy.Body.Sun,
    dateUtc,
    observer,
    true,
    true,
  )
  const moonHor = Astronomy.Horizon(
    dateUtc,
    observer,
    moonEq.ra,
    moonEq.dec,
    'normal',
  )
  const sunHor = Astronomy.Horizon(
    dateUtc,
    observer,
    sunEq.ra,
    sunEq.dec,
    'normal',
  )

  const mVec = vecFromAzAlt(moonHor.azimuth, moonHor.altitude)
  const sVec = vecFromAzAlt(sunHor.azimuth, sunHor.altitude)

  const phi = latitude * DEG

  // The Moon texture is rendered with the Moon's north pole up (≈ celestial
  // north). So the lighting must be expressed in the SAME celestial-north-up
  // frame; the as-seen tilt is then a single rotation of the whole group.
  //
  // Celestial north pole direction in the local ENU frame: due north, at an
  // altitude equal to the observer's latitude.
  const ncp: [number, number, number] = [0, Math.cos(phi), Math.sin(phi)]

  // "Up" = celestial north projected into the image plane; "right" follows.
  const northProj = norm([
    ncp[0] - dot(ncp, mVec) * mVec[0],
    ncp[1] - dot(ncp, mVec) * mVec[1],
    ncp[2] - dot(ncp, mVec) * mVec[2],
  ])
  const right = norm(cross(mVec, northProj))

  // Sun projected into the image plane = bright-limb direction (north-up frame).
  const limb = norm([dot(sVec, right), dot(sVec, northProj), 0])

  const pa = illum.phase_angle * DEG
  const sinPa = Math.sin(pa)
  const cosPa = Math.cos(pa)
  // +Z is toward the observer, so phaseAngle 0 (full) lights the near face.
  const sunDir: [number, number, number] = [
    sinPa * limb[0],
    sinPa * limb[1],
    cosPa,
  ]

  // Parallactic rotation: angle that carries celestial-north-up onto
  // zenith-up, i.e. how much to spin the disk so the local vertical points up.
  const zenith: [number, number, number] = [0, 0, 1]
  const zProj = norm([
    zenith[0] - dot(zenith, mVec) * mVec[0],
    zenith[1] - dot(zenith, mVec) * mVec[1],
    zenith[2] - dot(zenith, mVec) * mVec[2],
  ])
  const zx = dot(zProj, right)
  const zy = dot(zProj, northProj)
  const axisTilt = -Math.atan2(zx, zy)

  return {
    illumination: illum.phase_fraction,
    phaseAngle: illum.phase_angle,
    eclipticPhase,
    phaseKey: phaseKeyFromEcliptic(eclipticPhase),
    ageDays,
    distanceKm: lib.dist_km,
    libLon: lib.elon,
    libLat: lib.elat,
    sunDir,
    axisTilt,
    altitude: moonHor.altitude,
    azimuth: moonHor.azimuth,
  }
}
