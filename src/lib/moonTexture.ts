import * as THREE from 'three'

/**
 * Moon 8K texture URL (by environment).
 *
 * - Development: served from `public/textures/` (fast local iteration).
 * - Production: loaded from HTTPS CDN (keeps the deploy artifact small).
 *
 * Self-hosting / forking: replace `PROD_MOON_TEXTURE` with your own CDN URL.
 * Requirements: HTTPS, and `Access-Control-Allow-Origin` for WebGL + share-card capture.
 *
 * Optional override: set `VITE_MOON_TEXTURE_URL` in `.env.production` or CI secrets.
 */
const PROD_MOON_TEXTURE = 'https://assets.timeblind.xyz/moon_color_8k.jpg'

const LOCAL_MOON_TEXTURE = `${import.meta.env.BASE_URL}textures/moon_color_8k.jpg`

export const MOON_TEXTURE =
  import.meta.env.VITE_MOON_TEXTURE_URL ??
  (import.meta.env.PROD ? PROD_MOON_TEXTURE : LOCAL_MOON_TEXTURE)

export function configureMoonTextureLoader(loader: THREE.TextureLoader) {
  if (MOON_TEXTURE.startsWith('http')) {
    loader.setCrossOrigin('anonymous')
  }
}

let preloadStarted = false

/** Warm the texture cache (same loader settings as Moon.tsx). */
export function preloadMoonTexture() {
  if (preloadStarted) return
  preloadStarted = true
  const loader = new THREE.TextureLoader()
  configureMoonTextureLoader(loader)
  loader.load(MOON_TEXTURE)
}
