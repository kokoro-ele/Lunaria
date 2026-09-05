import { create } from 'zustand'
import type { MoonTextureQuality } from './lib/moonTexture'
import { timezoneFor, wallTimeAt } from './lib/timezone'
import { parseShareState } from './lib/shareUrl'

export interface AppState {
  /** Local date at the selected location, format YYYY-MM-DD */
  date: string
  /** Local time at the selected location, format HH:mm */
  time: string
  latitude: number
  longitude: number
  /** Whether the user has explicitly chosen a location yet */
  locationSelected: boolean
  /** Tilt the Moon to the angle actually seen from the chosen place (parallactic) */
  tiltCorrection: boolean
  /** Active moon surface texture resolution */
  textureQuality: MoonTextureQuality
  setTextureQuality: (quality: MoonTextureQuality) => void

  setDate: (date: string) => void
  setTime: (time: string) => void
  setDateTime: (date: string, time: string) => void
  setLocation: (latitude: number, longitude: number) => void
  setTiltCorrection: (tiltCorrection: boolean) => void
}

const DEFAULT_LATITUDE = 51.4779
const DEFAULT_LONGITUDE = -0.0015
const initialWallTime = wallTimeAt(
  new Date(),
  timezoneFor(DEFAULT_LATITUDE, DEFAULT_LONGITUDE),
)
const sharedState =
  typeof window === 'undefined' ? {} : parseShareState(window.location.search)
const hasSharedLocation =
  sharedState.latitude !== undefined && sharedState.longitude !== undefined

export const useStore = create<AppState>((set) => ({
  date: sharedState.date ?? initialWallTime.date,
  time: sharedState.time ?? initialWallTime.time,
  latitude: sharedState.latitude ?? DEFAULT_LATITUDE,
  longitude: sharedState.longitude ?? DEFAULT_LONGITUDE,
  locationSelected: hasSharedLocation,
  tiltCorrection: sharedState.tiltCorrection ?? true,
  textureQuality: '2k',

  setDate: (date) => set({ date }),
  setTime: (time) => set({ time }),
  setDateTime: (date, time) => set({ date, time }),
  setLocation: (latitude, longitude) =>
    set({ latitude, longitude, locationSelected: true }),
  setTiltCorrection: (tiltCorrection) => set({ tiltCorrection }),
  setTextureQuality: (textureQuality) => set({ textureQuality }),
}))
