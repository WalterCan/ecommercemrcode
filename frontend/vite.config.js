import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    // cacheDir removed to use default avoiding path issues
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
})
