import { useMemo, useRef, useState } from 'react'
import { Canvas, type ThreeEvent, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { feature } from 'topojson-client'
import countriesTopo from 'world-atlas/countries-110m.json'
import { latLonToVec3, vec3ToLatLon } from '../lib/geo'

const R = 1

function buildCoastlines(): Float32Array {
  const fc: any = feature(countriesTopo as any, (countriesTopo as any).objects.countries)
  const verts: number[] = []
  const pushRing = (ring: number[][]) => {
    for (let i = 0; i < ring.length - 1; i++) {
      const a = latLonToVec3(ring[i][1], ring[i][0], R * 1.001)
      const b = latLonToVec3(ring[i + 1][1], ring[i + 1][0], R * 1.001)
      verts.push(a.x, a.y, a.z, b.x, b.y, b.z)
    }
  }
  for (const f of fc.features) {
    const g = f.geometry
    if (!g) continue
    if (g.type === 'Polygon') {
      g.coordinates.forEach(pushRing)
    } else if (g.type === 'MultiPolygon') {
      g.coordinates.forEach((poly: number[][][]) => poly.forEach(pushRing))
    }
  }
  return new Float32Array(verts)
}

function buildGraticule(): Float32Array {
  const verts: number[] = []
  const step = 4
  for (let lon = -180; lon < 180; lon += 30) {
    for (let lat = -90; lat < 90; lat += step) {
      const a = latLonToVec3(lat, lon, R)
      const b = latLonToVec3(lat + step, lon, R)
      verts.push(a.x, a.y, a.z, b.x, b.y, b.z)
    }
  }
  for (let lat = -60; lat <= 60; lat += 30) {
    for (let lon = -180; lon < 180; lon += step) {
      const a = latLonToVec3(lat, lon, R)
      const b = latLonToVec3(lat, lon + step, R)
      verts.push(a.x, a.y, a.z, b.x, b.y, b.z)
    }
  }
  return new Float32Array(verts)
}

function Marker({ lat, lon }: { lat: number; lon: number }) {
  const pos = useMemo(() => latLonToVec3(lat, lon, R * 1.01), [lat, lon])
  const ringRef = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (ringRef.current) {
      const s = 1 + Math.sin(clock.elapsedTime * 2.5) * 0.18
      ringRef.current.scale.set(s, s, s)
    }
  })
  const quat = useMemo(() => {
    const q = new THREE.Quaternion()
    q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), pos.clone().normalize())
    return q
  }, [pos])
  return (
    <group position={pos} quaternion={quat}>
      <mesh>
        <sphereGeometry args={[0.022, 16, 16]} />
        <meshBasicMaterial color="#bcd2ff" />
      </mesh>
      <mesh ref={ringRef}>
        <ringGeometry args={[0.035, 0.044, 32]} />
        <meshBasicMaterial color="#bcd2ff" transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function GlobeMesh({
  lat,
  lon,
  onPick,
  autoSpin,
}: {
  lat: number
  lon: number
  onPick: (lat: number, lon: number) => void
  autoSpin: boolean
}) {
  const coast = useMemo(buildCoastlines, [])
  const grat = useMemo(buildGraticule, [])
  const groupRef = useRef<THREE.Group>(null)
  const pointerStart = useRef<{ x: number; y: number } | null>(null)

  useFrame((_, delta) => {
    if (groupRef.current && autoSpin) {
      groupRef.current.rotation.y += delta * 0.025
    }
  })

  const pickAt = (point: THREE.Vector3) => {
    const local = point.clone()
    if (groupRef.current) {
      groupRef.current.worldToLocal(local)
    }
    const { lat: la, lon: lo } = vec3ToLatLon(local, R)
    onPick(la, lo)
  }

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    pointerStart.current = { x: e.clientX, y: e.clientY }
  }

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    const start = pointerStart.current
    pointerStart.current = null
    if (!start) return

    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    // Treat as tap only if finger/mouse barely moved (not a drag-to-rotate).
    if (dx * dx + dy * dy > 324) return

    pickAt(e.point)
  }

  return (
    <group ref={groupRef}>
      <mesh onPointerDown={handlePointerDown} onPointerUp={handlePointerUp}>
        <sphereGeometry args={[R, 64, 64]} />
        <meshBasicMaterial color="#0a0f1a" transparent opacity={0.88} />
      </mesh>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[grat, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#2c3a57" transparent opacity={0.5} />
      </lineSegments>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[coast, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#9fb4dd" transparent opacity={0.85} />
      </lineSegments>
      <Marker lat={lat} lon={lon} />
    </group>
  )
}

interface GlobePickerProps {
  lat: number
  lon: number
  onPick: (lat: number, lon: number) => void
}

export default function GlobePicker({ lat, lon, onPick }: GlobePickerProps) {
  const [autoSpin, setAutoSpin] = useState(true)
  const idleTimer = useRef<number | null>(null)

  const pauseSpin = () => {
    setAutoSpin(false)
    if (idleTimer.current) window.clearTimeout(idleTimer.current)
    idleTimer.current = window.setTimeout(() => setAutoSpin(true), 2800)
  }

  const handlePick = (la: number, lo: number) => {
    pauseSpin()
    onPick(la, lo)
  }

  return (
    <Canvas
      camera={{ position: [0, 0.5, 2.5], fov: 40 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      style={{ touchAction: 'none' }}
    >
      <ambientLight intensity={1} />
      <GlobeMesh lat={lat} lon={lon} onPick={handlePick} autoSpin={autoSpin} />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        rotateSpeed={0.65}
        enableDamping
        dampingFactor={0.12}
        onStart={pauseSpin}
      />
    </Canvas>
  )
}
