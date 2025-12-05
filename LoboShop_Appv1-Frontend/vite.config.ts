/// <reference types="vitest" />

// import legacy from '@vitejs/plugin-legacy' // Deshabilitado temporalmente
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Forzar una sola instancia de React
      jsxRuntime: 'automatic',
    }),
    // Legacy deshabilitado temporalmente - puede causar problemas con React 19
    // legacy({
    //   targets: ['defaults', 'not IE 11'],
    //   modernPolyfills: true,
    // })
  ],
  build: {
    // Minificar y optimizar para producción
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Eliminar console.log en producción
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2, // Múltiples pases para mejor compresión
      },
      format: {
        comments: false, // Eliminar comentarios
      },
    },
    // Optimización de chunks - mejorado para performance
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Separar vendor chunks para mejor caching
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@ionic')) {
              return 'ionic-vendor';
            }
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            return 'vendor';
          }
        },
        // Optimizar nombres de archivos
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/css/[name]-[hash][extname]';
          }
          if (/\.(png|jpe?g|svg|gif|webp)$/.test(assetInfo.name || '')) {
            return 'assets/images/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    // Tamaño máximo de chunk - reducido para mejor performance
    chunkSizeWarningLimit: 500,
    // Generar source maps para producción (desactivado para mejor rendimiento)
    sourcemap: false,
    // Optimización de CSS
    cssCodeSplit: true,
    cssMinify: true,
    // Reporte de bundle size desactivado para velocidad
    reportCompressedSize: false,
  },
  // Optimización de dependencias
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@ionic/react'],
    exclude: [],
    // Forzar resolución única de React
    force: true,
    esbuildOptions: {
      // Asegurar que React se resuelva correctamente
      resolveExtensions: ['.jsx', '.js', '.tsx', '.ts'],
    },
  },
  // Resolver dependencias para evitar múltiples copias de React
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  // Configuración del servidor de desarrollo
  server: {
    headers: {
      'Cache-Control': 'public, max-age=31536000',
    },
  },
  // Previsualización
  preview: {
    port: 4173,
    strictPort: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  }
})
