import { create } from 'zustand'
import type { MoonTextureQuality } from './lib/moonTexture'

export interface AppState {
  /** Local date at the selected location, format YYYY-MM-DD */
  date: string
  /** Local time at the selected location, format HH:mm */
  time: string
  latitude: number
  longitude: number
  /** Whether the user has explicitly chosen a location yet */
  locationSelected: boolean
  /** Free-form custom message used on the share card */
  message: string
  /** Tilt the Moon to the angle actually seen from the chosen place (parallactic) */
  tiltCorrection: boolean
  /** Active moon surface texture resolution */
  textureQuality: MoonTextureQuality
  setTextureQuality: (quality: MoonTextureQuality) => void

  setDate: (date: string) => void
  setTime: (time: string) => void
  setLocation: (latitude: number, longitude: number) => void
  setMessage: (message: string) => void
  setTiltCorrection: (tiltCorrection: boolean) => void
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

const now = new Date()

export const useStore = create<AppState>((set) => ({
  date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
  time: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
  latitude: 51.4779,
  longitude: -0.0015,
  locationSelected: false,
  message: '',
  tiltCorrection: true,
  textureQuality: '2k',

  setDate: (date) => set({ date }),
  setTime: (time) => set({ time }),
  setLocation: (latitude, longitude) =>
    set({ latitude, longitude, locationSelected: true }),
  setMessage: (message) => set({ message }),
  setTiltCorrection: (tiltCorrection) => set({ tiltCorrection }),
  setTextureQuality: (textureQuality) => set({ textureQuality }),
}))
