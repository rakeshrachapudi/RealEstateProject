// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5173', // ✅ CHANGE THIS TO YOUR SPRING BOOT PORT
        changeOrigin: true,
      },
    }
  }
})