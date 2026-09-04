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
const TEXTURE_LOAD_TIMEOUT_MS = 10_000

function notify() {
  listeners.forEach((fn) => fn())
}

export function getMoonTextureUrl(quality: MoonTextureQuality): string {
  if (import.meta.env.VITE_MOON_TEXTURE_URL) {
    return import.meta.env.VITE_MOON_TEXTURE_URL
  }
  return import.meta.env.PROD ? PROD_TEXTURES[quality] : LOCAL_TEXTURES[quality]
}

function textureCandidates(quality: MoonTextureQuality): string[] {
  const primary = getMoonTextureUrl(quality)
  const candidates = import.meta.env.PROD
    ? [primary, LOCAL_TEXTURES[quality]]
    : [primary]
  return [...new Set(candidates)]
}

function loadTextureUrl(url: string): Promise<THREE.Texture> {
  const loader = new THREE.TextureLoader()
  if (url.startsWith('http')) {
    loader.setCrossOrigin('anonymous')
  }
  return new Promise((resolve, reject) => {
    let settled = false
    const timeout = globalThis.setTimeout(() => {
      settled = true
      reject(new Error(`Timed out while loading Moon texture: ${url}`))
    }, TEXTURE_LOAD_TIMEOUT_MS)
    loader.load(
      url,
      (texture) => {
        if (settled) {
          texture.dispose()
          return
        }
        settled = true
        globalThis.clearTimeout(timeout)
        resolve(texture)
      },
      undefined,
      (error) => {
        if (settled) return
        settled = true
        globalThis.clearTimeout(timeout)
        reject(error)
      },
    )
  })
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

  const promise = (async () => {
    let lastError: unknown
    for (const url of textureCandidates(quality)) {
      try {
        const texture = await loadTextureUrl(url)
        texture.colorSpace = THREE.SRGBColorSpace
        cache.set(quality, texture)
        return texture
      } catch (error) {
        lastError = error
      }
    }
    throw lastError instanceof Error
      ? lastError
      : new Error(`Unable to load the ${quality} Moon texture`)
  })().finally(() => {
    inflight.delete(quality)
    notify()
  })

  inflight.set(quality, promise)
  notify()
  return promise
}
