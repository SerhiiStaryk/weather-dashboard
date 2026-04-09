import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // forward any /api/* requests to the backend at :5201 to avoid CORS during dev
      '/api': {
        target: 'http://localhost:5201',
        changeOrigin: true,
        secure: false,
        // preserve the path (/api/whatever -> /api/whatever)
        rewrite: path => path,
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
  },
});
