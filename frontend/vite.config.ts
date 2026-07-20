import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { alphaTab } from '@coderline/alphatab-vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), alphaTab()],
  server: {
    // host.docker.internal lets browser-automation containers reach the dev server
    allowedHosts: ['host.docker.internal'],
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})
