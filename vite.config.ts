import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'InCampus',
        short_name: 'InCampus',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#181c24',
        icons: [
          {
            src: '/navlogo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/navlogo.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
