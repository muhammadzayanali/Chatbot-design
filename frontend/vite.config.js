import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Static files (favicon, etc.) — folder is `Public` in this repo; name must match on case-sensitive hosts
  publicDir: 'Public',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/chatbot': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
