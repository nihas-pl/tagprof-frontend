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
  server: {
    port: 5173,
    strictPort: false,
    hmr: {
      port: 5173,
    },
    allowedHosts: [
      'f353-103-165-20-107.ngrok-free.app',
      '.ngrok-free.app',
      '.ngrok.io',
    ],
  },
})
