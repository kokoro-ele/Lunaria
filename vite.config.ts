import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages project site: https://<user>.github.io/Lunaria/
// Local dev keeps base at /. CI sets VITE_BASE=/Lunaria/
const base = process.env.VITE_BASE ?? '/'

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    host: true,
  },
})
