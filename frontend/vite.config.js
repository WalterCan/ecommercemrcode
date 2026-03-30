import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    // cacheDir removed to use default avoiding path issues
    server: {
        host: true,
        port: 5173,
        allowedHosts: ['vibrabonito.com.ar', 'www.vibrabonito.com.ar', 'vps-5311710-x.dattaweb.com'],
        proxy: {
            '/api': {
                // Usa el nombre del contenedor de Docker (backend:3000) o localhost para desarrollo sin docker
                target: process.env.VITE_API_URL_PROXY || 'http://backend:3000',
                changeOrigin: true,
                secure: false
            }
        },
        watch: {
            usePolling: true,
            interval: 2000,
            binaryInterval: 3000,
            ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**', '**/public/**', '**/.DS_Store', '**/coverage/**']
        },
        hmr: {
            host: 'localhost',
            clientPort: 5176
        }
    },
    optimizeDeps: {
        force: false,
    },
    build: {
        // Optimizaciones de bundle
        rollupOptions: {
            output: {
                // Code splitting manual por chunks
                manualChunks: {
                    // Vendor chunks
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                    'ui-vendor': ['react-toastify'],
                    // Admin pages en chunk separado
                    'admin': [
                        './src/pages/admin/AdminDashboard.jsx',
                        './src/pages/admin/AdminProducts.jsx',
                        './src/pages/admin/AdminOrders.jsx',
                        './src/pages/admin/AdminSettings.jsx'
                    ]
                }
            }
        },
        // Límite de advertencia de tamaño de chunk
        chunkSizeWarningLimit: 1000,
        // Minificación
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true, // Eliminar console.log en producción
                drop_debugger: true
            }
        },
        // Source maps solo en desarrollo
        sourcemap: false
    }
})
