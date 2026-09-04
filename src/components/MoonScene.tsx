import { Suspense, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Stars, OrbitControls } from '@react-three/drei'
import Moon from './Moon'
import { setMoonCanvas } from '../lib/capture'
import type { MoonView } from '../lib/astronomy'
import { MOON_CAMERA } from '../lib/moonCamera'
import { useIsMobile } from '../hooks/useIsMobile'

interface MoonSceneProps {
  view: MoonView
  tiltCorrection: boolean
  retryKey?: number
  onBootstrapReady?: () => void
  onBootstrapError?: () => void
}

function LockView({ locked }: { locked: boolean }) {
  const controls = useThree((s) => s.controls) as { reset?: () => void } | null
  useEffect(() => {
    if (locked && controls?.reset) controls.reset()
  }, [locked, controls])
  return null
}

export default function MoonScene({
  view,
  tiltCorrection,
  retryKey,
  onBootstrapReady,
  onBootstrapError,
}: MoonSceneProps) {
  const isMobile = useIsMobile()
  const cam = isMobile ? MOON_CAMERA.mobile : MOON_CAMERA.desktop

  return (
    <Canvas
      orthographic
      camera={{
        position: cam.position,
        zoom: cam.zoom,
        near: 0.1,
        far: 100,
      }}
      gl={{
        preserveDrawingBuffer: true,
        antialias: !isMobile,
        alpha: false,
        powerPreference: 'high-performance',
      }}
      dpr={isMobile ? [1, 1.5] : [1, 2]}
      onCreated={({ gl, scene }) => {
        gl.setClearColor('#04060a', 1)
        scene.background = null
        setMoonCanvas(gl.domElement)
      }}
    >
      <Suspense fallback={null}>
        <Stars
          radius={60}
          depth={40}
          count={isMobile ? 1200 : 2600}
          factor={3.2}
          saturation={0}
          fade
          speed={0.4}
        />
        <Moon
          view={view}
          tiltCorrection={tiltCorrection}
          retryKey={retryKey}
          onBootstrapReady={onBootstrapReady}
          onBootstrapError={onBootstrapError}
        />
      </Suspense>
      <LockView locked={tiltCorrection} />
      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom
        enableRotate={!tiltCorrection}
        minZoom={MOON_CAMERA.zoom.min}
        maxZoom={MOON_CAMERA.zoom.max}
        rotateSpeed={0.4}
        zoomSpeed={0.5}
        enableDamping
        dampingFactor={0.08}
      />
    </Canvas>
  )
}
