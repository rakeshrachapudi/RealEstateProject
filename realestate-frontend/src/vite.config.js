// vite.config.js - OPTIMIZED VERSION
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react({
      // Enable Fast Refresh
      fastRefresh: true,
      // Babel configuration for better tree-shaking
      babel: {
        plugins: [
          // Remove React PropTypes in production
          ['babel-plugin-transform-react-remove-prop-types', { removeImport: true }]
        ]
      }
    }),
    // Bundle analyzer - creates stats.html after build
    // Uncomment to analyze bundle size
    // Install: npm install --save-dev rollup-plugin-visualizer
    // visualizer({
    //   open: true,
    //   gzipSize: true,
    //   brotliSize: true,
    //   filename: 'dist/stats.html'
    // })
  ],

  // Build optimization
  build: {
    // Output directory
    outDir: 'dist',

    // Generate sourcemaps for production debugging (disable for smaller builds)
    sourcemap: false,

    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console.log in production
        drop_console: true,
        drop_debugger: true,
        // Remove dead code
        dead_code: true,
        // Reduce function names
        keep_fnames: false,
        keep_classnames: false
      },
      format: {
        // Remove comments
        comments: false
      }
    },

    // Chunk size warning limit (in KB)
    chunkSizeWarningLimit: 1000,

    // Rollup options for code splitting
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: (id) => {
          // Vendor chunk - React core libraries
          if (id.includes('node_modules/react') ||
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/react-router-dom')) {
            return 'react-vendor';
          }

          // React ecosystem
          if (id.includes('node_modules/react-helmet-async') ||
              id.includes('node_modules/scheduler')) {
            return 'react-ecosystem';
          }

          // AWS SDK
          if (id.includes('node_modules/@aws-sdk')) {
            return 'aws-sdk';
          }

          // Analytics (if imported)
          if (id.includes('/components/Analytics/')) {
            return 'analytics';
          }

          // UI components (if large)
          if (id.includes('/components/') && !id.includes('/Analytics/')) {
            return 'ui-components';
          }

          // Other node_modules
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },

        // Asset file naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];

          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          } else if (/woff2?|ttf|otf|eot/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },

        // JavaScript chunk naming
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js'
      }
    },

    // CSS code splitting
    cssCodeSplit: true,

    // Report compressed size (slower but useful for optimization)
    reportCompressedSize: true,

    // Adjust for larger apps
    assetsInlineLimit: 4096, // 4KB - inline smaller assets as base64
  },

  // Development server
  server: {
    port: 5173,
    strictPort: false,
    host: true, // Listen on all addresses
    open: true, // Auto-open browser
    cors: true,
    // Proxy API requests in development (if needed)
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:8080',
    //     changeOrigin: true,
    //     secure: false
    //   }
    // }
  },

  // Preview server (after build)
  preview: {
    port: 4173,
    strictPort: false,
    host: true,
    open: true
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-helmet-async'
    ],
    exclude: [] // Add packages to exclude from pre-bundling
  },

  // Enable esbuild for faster builds
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    // Drop console.log in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  },

  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString())
  }
});