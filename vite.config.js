import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: 'frontend',
  plugins: [react()],
  server: {
    proxy: { '/api': 'http://localhost:4000' },
  },
  build: {
    outDir: 'dist',       // will be frontend/dist
    emptyOutDir: true,
  },
})
