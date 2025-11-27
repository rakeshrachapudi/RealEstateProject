// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    // Analyze bundle size (optional, install: npm install --save-dev rollup-plugin-visualizer)
    // visualizer({ open: true, gzipSize: true, brotliSize: true })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // AWS SDK (if used)
          'aws-sdk': ['@aws-sdk/client-s3'],
          // Analytics
          'analytics': [
            './src/components/Analytics/GoogleAnalytics',
            './src/components/Analytics/MetaPixel'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true
      }
    }
  },
  server: {
    port: 5173,
    strictPort: false
  },
  preview: {
    port: 4173
  }
});