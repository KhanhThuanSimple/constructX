import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    // sockjs-client uses Node.js `global` — polyfill for browser
    global: 'globalThis',
  },
})
