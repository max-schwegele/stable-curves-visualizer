import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/stable-curves-visualizer/',
  plugins: [react()],
  build: {
    // Three.js is required for the initial view. Warn above the profiled baseline.
    chunkSizeWarningLimit: 1600,
  },
})
