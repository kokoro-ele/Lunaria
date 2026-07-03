import * as THREE from 'three'

const DEG = Math.PI / 180

/** Convert geographic lon/lat (degrees) to a point on a sphere of radius r. */
export function latLonToVec3(lat: number, lon: number, r = 1): THREE.Vector3 {
  const phi = (90 - lat) * DEG
  const theta = (lon + 180) * DEG
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  )
}

/** Inverse of latLonToVec3 — recover lon/lat (degrees) from a sphere point. */
export function vec3ToLatLon(v: THREE.Vector3, r = 1): { lat: number; lon: number } {
  const phi = Math.acos(THREE.MathUtils.clamp(v.y / r, -1, 1))
  const lat = 90 - phi / DEG
  let lon = Math.atan2(v.z, -v.x) / DEG - 180
  if (lon < -180) lon += 360
  if (lon > 180) lon -= 360
  return { lat, lon }
}
