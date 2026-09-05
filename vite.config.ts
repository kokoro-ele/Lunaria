import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

// GitHub Pages project site: https://<user>.github.io/Lunaria/
// Local dev keeps base at /. CI sets VITE_BASE=/Lunaria/
const base = process.env.VITE_BASE ?? '/'

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        app: resolve(import.meta.dirname, 'index.html'),
        about: resolve(import.meta.dirname, 'about.html'),
        en: resolve(import.meta.dirname, 'en/index.html'),
        enMoonPhaseToday: resolve(import.meta.dirname, 'en/moon-phase-today/index.html'),
        enMoonCalendar2026: resolve(import.meta.dirname, 'en/moon-phase-calendar-2026/index.html'),
        enMoonCalendar2027: resolve(import.meta.dirname, 'en/moon-phase-calendar-2027/index.html'),
        enBirthdayMoon: resolve(import.meta.dirname, 'en/moon-on-birthday/index.html'),
        enLunarLibration: resolve(import.meta.dirname, 'en/guides/lunar-libration/index.html'),
        zh: resolve(import.meta.dirname, 'zh/index.html'),
        zhMoonPhaseToday: resolve(import.meta.dirname, 'zh/today-moon/index.html'),
        zhMoonCalendar2026: resolve(import.meta.dirname, 'zh/2026-moon-calendar/index.html'),
        zhMoonCalendar2027: resolve(import.meta.dirname, 'zh/2027-moon-calendar/index.html'),
        zhBirthdayMoon: resolve(import.meta.dirname, 'zh/moon-on-birthday/index.html'),
        zhLunarLibration: resolve(import.meta.dirname, 'zh/guides/lunar-libration/index.html'),
      },
    },
  },
  server: {
    host: true,
  },
})
