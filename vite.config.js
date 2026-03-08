import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    visualizer({
      filename: 'dist/bundle-report.html',
      gzipSize: true,
      brotliSize: true,
      open: false,
    }),
  ],
  build: {
    target: 'es2020',
    cssTarget: 'es2020',
    modulePreload: { polyfill: false },
    minify: 'esbuild',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    hmr: {
      host: 'localhost',
      port: 5173,
    },
  },
})
