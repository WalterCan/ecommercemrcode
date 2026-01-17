import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: true, // Necesario para que Docker pueda acceder
        port: 5173,
        watch: {
            usePolling: true, // Útil para Docker en Windows
        },
    },
})
