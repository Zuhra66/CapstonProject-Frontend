import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Fix Render / Node crypto issue
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {}, // prevent undefined process
  },
  resolve: {
    alias: {
      crypto: 'crypto-js',
    },
  },
})
