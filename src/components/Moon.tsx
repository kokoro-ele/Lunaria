import { useMemo } from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import type { MoonView } from '../lib/astronomy'

const DEG = Math.PI / 180

interface MoonProps {
  view: MoonView
  hiRes: boolean
  tiltCorrection: boolean
}

export default function Moon({ view, hiRes, tiltCorrection }: MoonProps) {
  const url = hiRes
    ? `${import.meta.env.BASE_URL}textures/moon_color_8k.jpg`
    : `${import.meta.env.BASE_URL}textures/moon_color_2k.jpg`
  const colorMap = useTexture(url)

  useMemo(() => {
    colorMap.colorSpace = THREE.SRGBColorSpace
    colorMap.anisotropy = 8
    colorMap.needsUpdate = true
  }, [colorMap])

  // Direction from Moon toward the Sun, in scene/screen frame.
  const sun = view.sunDir
  const sunPos = useMemo(
    () => new THREE.Vector3(sun[0], sun[1], sun[2]).normalize().multiplyScalar(10),
    [sun[0], sun[1], sun[2]],
  )

  // Surface orientation. On a three.js sphere the equirectangular texture's
  // centre (lon 0 = the near-side centre) sits on +X and the north pole on +Y.
  // Rotating -90° about Y brings the near-side centre to face the camera (+Z)
  // with west on the left, east on the right and north up — i.e. the familiar
  // Earth-view of the Moon. Libration then nudges the sub-Earth point.
  const meshRotation = useMemo<[number, number, number]>(
    () => [view.libLat * DEG, -Math.PI / 2 - view.libLon * DEG, 0],
    [view.libLat, view.libLon],
  )

  return (
    <group rotation={[0, 0, tiltCorrection ? view.axisTilt : 0]}>
      {/* The Sun: crisp directional light that defines the terminator */}
      <directionalLight position={sunPos} intensity={3.2} color={'#fff6e8'} />
      {/* Earthshine: faint cool fill on the near (camera-facing) side */}
      <directionalLight position={[0, 0, 6]} intensity={0.07} color={'#2a3f6b'} />
      <ambientLight intensity={0.015} color={'#1a2238'} />

      <mesh rotation={meshRotation}>
        <sphereGeometry args={[1, 256, 256]} />
        <meshStandardMaterial
          map={colorMap}
          bumpMap={colorMap}
          bumpScale={0.012}
          roughness={1}
          metalness={0}
        />
      </mesh>
    </group>
  )
}
