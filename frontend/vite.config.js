import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    cacheDir: '/app/node_modules/.vite',
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
            usePolling: true, // Importante para Docker en Windows
            ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**']
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
