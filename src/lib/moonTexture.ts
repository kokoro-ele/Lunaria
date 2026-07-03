import * as THREE from 'three'

export type MoonTextureQuality = '2k' | '4k' | '8k'

export const MOON_TEXTURE_QUALITIES: MoonTextureQuality[] = ['2k', '4k', '8k']

/** Loading screen dismisses once this tier is ready. */
export const BOOTSTRAP_TEXTURE_QUALITY: MoonTextureQuality = '2k'

/**
 * Moon texture URLs by resolution.
 *
 * Self-hosting: replace `PROD_TEXTURES` with your HTTPS CDN URLs (+ CORS).
 * Optional override: `VITE_MOON_TEXTURE_URL` forces a single URL for all tiers.
 */
const PROD_TEXTURES: Record<MoonTextureQuality, string> = {
  '2k': 'https://assets.timeblind.xyz/moon_color_2k.jpg',
  '4k': 'https://assets.timeblind.xyz/moon_color_4k.jpg',
  /** Upload to CDN when ready; until then falls back to the bundled asset. */
  '8k': 'https://assets.timeblind.xyz/moon_color_8k.jpg',
}

const LOCAL_TEXTURES: Record<MoonTextureQuality, string> = {
  '2k': `${import.meta.env.BASE_URL}textures/moon_color_2k.jpg`,
  '4k': `${import.meta.env.BASE_URL}textures/moon_color_4k.jpg`,
  '8k': `${import.meta.env.BASE_URL}textures/moon_color_8k.jpg`,
}

const cache = new Map<MoonTextureQuality, THREE.Texture>()
const inflight = new Map<MoonTextureQuality, Promise<THREE.Texture>>()
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((fn) => fn())
}

export function getMoonTextureUrl(quality: MoonTextureQuality): string {
  if (import.meta.env.VITE_MOON_TEXTURE_URL) {
    return import.meta.env.VITE_MOON_TEXTURE_URL
  }
  return import.meta.env.PROD ? PROD_TEXTURES[quality] : LOCAL_TEXTURES[quality]
}

function configureLoader(loader: THREE.TextureLoader) {
  const url = getMoonTextureUrl('2k')
  if (url.startsWith('http')) {
    loader.setCrossOrigin('anonymous')
  }
}

export function isMoonTextureLoaded(quality: MoonTextureQuality): boolean {
  return cache.has(quality)
}

export function isMoonTextureLoading(quality: MoonTextureQuality): boolean {
  return inflight.has(quality)
}

export function subscribeMoonTexture(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function loadMoonTexture(quality: MoonTextureQuality): Promise<THREE.Texture> {
  const cached = cache.get(quality)
  if (cached) return Promise.resolve(cached)

  const pending = inflight.get(quality)
  if (pending) return pending

  const promise = new Promise<THREE.Texture>((resolve, reject) => {
    const loader = new THREE.TextureLoader()
    configureLoader(loader)
    loader.load(
      getMoonTextureUrl(quality),
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace
        cache.set(quality, texture)
        inflight.delete(quality)
        notify()
        resolve(texture)
      },
      undefined,
      (err) => {
        inflight.delete(quality)
        notify()
        reject(err)
      },
    )
  })

  inflight.set(quality, promise)
  notify()
  return promise
}

/** Preload 4K in the background after the app is interactive. */
export function preloadOptionalMoonTextures() {
  loadMoonTexture('4k').catch(() => {})
}
