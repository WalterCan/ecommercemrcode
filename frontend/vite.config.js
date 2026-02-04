import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    cacheDir: './node_modules/.vite',
    server: {
        host: true,
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:3002',
                changeOrigin: true,
                secure: false
            }
        },
        watch: {
            usePolling: true,
            interval: 500, // Menos frecuente para ahorrar CPU/Memoria
            ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**', '**/public/**']
        },
        hmr: {
            host: 'localhost',
            clientPort: 5176 // Puerto expuesto en docker-compose
        }
    },
    optimizeDeps: {
        force: false,
    },
})
