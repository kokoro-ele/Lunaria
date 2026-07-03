import { useMemo } from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import type { MoonView } from '../lib/astronomy'
import { useIsMobile } from '../hooks/useIsMobile'

const DEG = Math.PI / 180
const MOON_TEXTURE = `${import.meta.env.BASE_URL}textures/moon_color_8k.jpg`

interface MoonProps {
  view: MoonView
  tiltCorrection: boolean
}

export default function Moon({ view, tiltCorrection }: MoonProps) {
  const isMobile = useIsMobile()
  const colorMap = useTexture(MOON_TEXTURE)
  const segments = isMobile ? 128 : 256

  useMemo(() => {
    colorMap.colorSpace = THREE.SRGBColorSpace
    colorMap.anisotropy = isMobile ? 4 : 8
    colorMap.needsUpdate = true
  }, [colorMap, isMobile])

  const sun = view.sunDir
  const sunPos = useMemo(
    () => new THREE.Vector3(sun[0], sun[1], sun[2]).normalize().multiplyScalar(10),
    [sun[0], sun[1], sun[2]],
  )

  const meshRotation = useMemo<[number, number, number]>(
    () => [view.libLat * DEG, -Math.PI / 2 - view.libLon * DEG, 0],
    [view.libLat, view.libLon],
  )

  return (
    <group rotation={[0, 0, tiltCorrection ? view.axisTilt : 0]}>
      <directionalLight position={sunPos} intensity={3.2} color={'#fff6e8'} />
      <directionalLight position={[0, 0, 6]} intensity={0.07} color={'#2a3f6b'} />
      <ambientLight intensity={0.015} color={'#1a2238'} />

      <mesh rotation={meshRotation}>
        <sphereGeometry args={[1, segments, segments]} />
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
