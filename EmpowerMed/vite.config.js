import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
  },
  define: {
    global: 'window', // critical: fixes "crypto.hash" error in SSR builds
    'process.env': {}, // prevent undefined process
  },
})
