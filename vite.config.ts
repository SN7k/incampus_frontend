import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  // Force production mode
  mode: 'production',
  // Define environment variables
  define: {
    'import.meta.env.DEV': JSON.stringify(false),
    'import.meta.env.PROD': JSON.stringify(true),
    'import.meta.env.MODE': JSON.stringify('production'),
  },
  // Build options
  build: {
    sourcemap: false,
    minify: true,
  },
});
