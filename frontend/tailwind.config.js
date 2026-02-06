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
            keyframes: {
                'fade-in-down': {
                    '0%': {
                        opacity: '0',
                        transform: 'translateY(-10px)'
                    },
                    '100%': {
                        opacity: '1',
                        transform: 'translateY(0)'
                    },
                },
                'gradient-x': {
                    '0%, 100%': {
                        'background-size': '200% 200%',
                        'background-position': 'left center'
                    },
                    '50%': {
                        'background-size': '200% 200%',
                        'background-position': 'right center'
                    },
                },
                'typing': {
                    'from': { width: '0' },
                    'to': { width: '100%' }
                }
            },
            animation: {
                'fade-in-down': 'fade-in-down 0.5s ease-out',
                'gradient-x': 'gradient-x 3s ease infinite',
                'typing': 'typing 3.5s steps(40, end)',
            }
        },
    },
    plugins: [],
}
