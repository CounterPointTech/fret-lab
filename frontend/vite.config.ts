import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { alphaTab } from '@coderline/alphatab-vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), alphaTab()],
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})
