import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Assistance System',
        short_name: 'AS',
        description: 'Sistema de Control de Asistencia',
        theme_color: '#4F46E5',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/AS-Logo-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/AS-Logo-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  base: '/app-asistencia/',
  server: {
    port: 3000,
    open: true
  }
})