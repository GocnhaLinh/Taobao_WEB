import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  appType: 'spa',
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (
              id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('react-router-dom')
            ) {
              return 'vendor';
            }
            if (id.includes('@tanstack')) {
              return 'query';
            }
            if (
              id.includes('lucide-react') ||
              id.includes('class-variance-authority')
            ) {
              return 'ui';
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 500,
    target: 'es2020',
  },
})
