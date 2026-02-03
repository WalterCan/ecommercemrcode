/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Paleta Elegante para Perfumería
                rose: {
                    DEFAULT: 'var(--color-primary)',
                    dark: 'var(--color-primary)', // Simplification: using same for dark/light variations
                    light: 'var(--color-primary)'
                },
                champagne: {
                    DEFAULT: 'var(--color-bg-secondary)',
                    dark: 'var(--color-bg-secondary)',
                    light: 'var(--color-bg-secondary)'
                },
                gold: {
                    DEFAULT: 'var(--color-secondary)',
                    dark: 'var(--color-secondary)',
                    light: 'var(--color-secondary)'
                },
                lavender: {
                    DEFAULT: 'var(--color-secondary)',
                    dark: 'var(--color-secondary)',
                    light: 'var(--color-secondary)'
                },
                // Alias para compatibilidad con código existente
                earth: {
                    DEFAULT: 'var(--color-primary)',
                    dark: 'var(--color-primary)',
                    light: 'var(--color-primary)'
                },
                beige: {
                    DEFAULT: 'var(--color-bg-secondary)',
                    dark: 'var(--color-bg-secondary)',
                    light: 'var(--color-bg-secondary)'
                },
                terracotta: {
                    DEFAULT: 'var(--color-secondary)',
                    dark: 'var(--color-secondary)',
                    light: 'var(--color-secondary)'
                },
                moss: {
                    DEFAULT: 'var(--color-secondary)',
                    dark: 'var(--color-secondary)',
                    light: 'var(--color-secondary)'
                },
                primary: {
                    DEFAULT: 'var(--color-primary)',
                    dark: 'var(--color-primary)',
                    light: 'var(--color-primary)'
                },
                paper: 'var(--color-bg-primary)', // Color de fondo principal dinámico
            },
            fontFamily: {
                // Tipografía Elegante
                serif: ['"Playfair Display"', 'serif'],
                sans: ['Montserrat', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
