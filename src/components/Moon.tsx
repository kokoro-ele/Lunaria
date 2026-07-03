import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import type { MoonView } from '../lib/astronomy'
import {
  BOOTSTRAP_TEXTURE_QUALITY,
  loadMoonTexture,
} from '../lib/moonTexture'
import { useStore } from '../store'
import { useIsMobile } from '../hooks/useIsMobile'

const DEG = Math.PI / 180

interface MoonProps {
  view: MoonView
  tiltCorrection: boolean
  /** Fires once when the bootstrap (2K) texture is applied. */
  onBootstrapReady?: () => void
}

export default function Moon({ view, tiltCorrection, onBootstrapReady }: MoonProps) {
  const isMobile = useIsMobile()
  const textureQuality = useStore((s) => s.textureQuality)
  const [colorMap, setColorMap] = useState<THREE.Texture | null>(null)
  const bootstrapped = useRef(false)
  const segments = isMobile ? 128 : 256

  useEffect(() => {
    let alive = true

    loadMoonTexture(textureQuality).then((tex) => {
      if (!alive) return
      tex.anisotropy = isMobile ? 4 : 8
      tex.needsUpdate = true
      setColorMap(tex)

      if (textureQuality === BOOTSTRAP_TEXTURE_QUALITY && !bootstrapped.current) {
        bootstrapped.current = true
        onBootstrapReady?.()
      }
    })

    return () => {
      alive = false
    }
  }, [textureQuality, isMobile, onBootstrapReady])

  const sun = view.sunDir
  const sunPos = useMemo(
    () => new THREE.Vector3(sun[0], sun[1], sun[2]).normalize().multiplyScalar(10),
    [sun[0], sun[1], sun[2]],
  )

  const meshRotation = useMemo<[number, number, number]>(
    () => [view.libLat * DEG, -Math.PI / 2 - view.libLon * DEG, 0],
    [view.libLat, view.libLon],
  )

  if (!colorMap) return null

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
