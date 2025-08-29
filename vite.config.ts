import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/ar-box-app2/',
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
