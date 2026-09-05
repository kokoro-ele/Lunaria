import * as THREE from 'three'

export function mountLightweightMoonPreview(
  canvas: HTMLCanvasElement,
  phaseAngle: number,
) {
  const stage = canvas.parentElement
  if (!stage) return

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'low-power',
  })
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.08

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 10)
  camera.position.z = 4.2

  const geometry = new THREE.SphereGeometry(1, 64, 40)
  const material = new THREE.MeshStandardMaterial({
    color: '#d8dce4',
    roughness: 1,
    metalness: 0,
  })
  const moon = new THREE.Mesh(geometry, material)
  moon.rotation.y = -Math.PI / 2
  moon.rotation.x = -0.035
  scene.add(moon)

  const phaseRadians = (phaseAngle * Math.PI) / 180
  const sunlight = new THREE.DirectionalLight('#fff7e9', 3.6)
  sunlight.position.set(
    Math.sin(phaseRadians) * 4,
    0.32,
    -Math.cos(phaseRadians) * 4,
  )
  scene.add(sunlight)
  scene.add(new THREE.DirectionalLight('#6d86bd', 0.055))
  scene.add(new THREE.AmbientLight('#18223b', 0.025))

  const render = () => renderer.render(scene, camera)
  const resize = () => {
    const width = Math.max(stage.clientWidth, 1)
    const height = Math.max(stage.clientHeight, 1)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    render()
  }
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(stage)
  resize()

  const textureUrl = `${import.meta.env.BASE_URL}textures/moon_color_512.jpg`
  new THREE.TextureLoader().load(
    textureUrl,
    (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace
      texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4)
      material.map = texture
      material.bumpMap = texture
      material.bumpScale = 0.009
      material.needsUpdate = true
      stage.classList.add('is-ready')
      render()
    },
    undefined,
    () => {
      stage.classList.add('is-ready')
      render()
    },
  )

  window.addEventListener(
    'pagehide',
    () => {
      resizeObserver.disconnect()
      material.map?.dispose()
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    },
    { once: true },
  )
}
