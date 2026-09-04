import { create } from 'zustand'
import type { MoonTextureQuality } from './lib/moonTexture'
import { timezoneFor, wallTimeAt } from './lib/timezone'

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

export const useStore = create<AppState>((set) => ({
  date: initialWallTime.date,
  time: initialWallTime.time,
  latitude: DEFAULT_LATITUDE,
  longitude: DEFAULT_LONGITUDE,
  locationSelected: false,
  tiltCorrection: true,
  textureQuality: '2k',

  setDate: (date) => set({ date }),
  setTime: (time) => set({ time }),
  setDateTime: (date, time) => set({ date, time }),
  setLocation: (latitude, longitude) =>
    set({ latitude, longitude, locationSelected: true }),
  setTiltCorrection: (tiltCorrection) => set({ tiltCorrection }),
  setTextureQuality: (textureQuality) => set({ textureQuality }),
}))
