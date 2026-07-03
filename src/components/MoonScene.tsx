import { Suspense, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Stars, OrbitControls } from '@react-three/drei'
import Moon from './Moon'
import { setMoonCanvas } from '../lib/capture'
import type { MoonView } from '../lib/astronomy'

interface MoonSceneProps {
  view: MoonView
  hiRes: boolean
  tiltCorrection: boolean
}

/** Snap the camera back to the correct front-on framing when the view locks. */
function LockView({ locked }: { locked: boolean }) {
  const controls = useThree((s) => s.controls) as { reset?: () => void } | null
  useEffect(() => {
    if (locked && controls?.reset) controls.reset()
  }, [locked, controls])
  return null
}

export default function MoonScene({ view, hiRes, tiltCorrection }: MoonSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.4], fov: 32, near: 0.1, far: 100 }}
      gl={{
        preserveDrawingBuffer: true,
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      }}
      dpr={[1, 2]}
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
          count={2600}
          factor={3.2}
          saturation={0}
          fade
          speed={0.4}
        />
        <Moon view={view} hiRes={hiRes} tiltCorrection={tiltCorrection} />
      </Suspense>
      <LockView locked={tiltCorrection} />
      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom
        // When showing the true local viewing angle, lock orientation so the
        // physically-correct framing can't be rotated away.
        enableRotate={!tiltCorrection}
        minDistance={2.6}
        maxDistance={8}
        rotateSpeed={0.4}
        zoomSpeed={0.5}
        enableDamping
        dampingFactor={0.08}
      />
    </Canvas>
  )
}
