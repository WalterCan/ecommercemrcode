import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: true, // Necesario para que Docker pueda acceder
        port: 5173,
        watch: null, // Deshabilitar file watching
        hmr: false, // Deshabilitar HMR
    },
})
