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
                    DEFAULT: '#D4A5A5', // Rosa suave para acentos primarios
                    dark: '#B88B8B',
                    light: '#E8C5C5'
                },
                champagne: {
                    DEFAULT: '#F7E7CE', // Fondo general elegante
                    dark: '#E8D4B5',
                    light: '#FFF5E6'
                },
                gold: {
                    DEFAULT: '#C9A961', // Oro/dorado para destacados
                    dark: '#B08F4D',
                    light: '#DFC285'
                },
                lavender: {
                    DEFAULT: '#B8A9C9', // Lavanda suave
                    dark: '#9A8AAB',
                    light: '#D4C8E0'
                },
                // Alias para compatibilidad con código existente
                earth: {
                    DEFAULT: '#D4A5A5', // = rose
                    dark: '#B88B8B',
                    light: '#E8C5C5'
                },
                beige: {
                    DEFAULT: '#F7E7CE', // = champagne
                    dark: '#E8D4B5',
                    light: '#FFF5E6'
                },
                terracotta: {
                    DEFAULT: '#C9A961', // = gold
                    dark: '#B08F4D',
                    light: '#DFC285'
                },
                moss: {
                    DEFAULT: '#B8A9C9', // = lavender
                    dark: '#9A8AAB',
                    light: '#D4C8E0'
                },
                paper: '#FFFBF5', // Color de fondo principal muy suave
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
