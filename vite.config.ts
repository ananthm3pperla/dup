import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  optimizeDeps: {
    exclude: [
      'src/components/PrivateRoute',
      'src/components/layout/Layout',
      'src/components/dashboard/CheckInCard'
    ]
  },
  server: {
    hmr: {
      overlay: false
    },
    watch: {
      usePolling: true
    },
    clearScreen: false,
    middlewareMode: false
  },
  build: {
    sourcemap: true,
    commonjsOptions: {
      transformMixedEsModules: true
    },
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      }
    }
  },
  cacheDir: '.vite'
});