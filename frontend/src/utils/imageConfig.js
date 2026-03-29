/**
 * Formatea la URL de la imagen para que sea accesible desde el frontend.
 * Si la imagen es una ruta local (comienza con /uploads), le añade la URL del backend.
 * Si es una URL externa (http...), la devuelve tal cual.
 */
export const formatImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/400x400?text=Sin+Imagen';

    if (url.startsWith('http')) return url;

    // Usamos la raíz actual del dominio si estamos en el navegador
    const origin = typeof window !== 'undefined' ? window.location.origin : (import.meta.env.VITE_API_URL || '').replace(/\/api$/, '');

    // Limpiamos la ruta: quitamos /uploads inicial si ya lo trae, porque lo pondremos nosotros
    // o aseguramos que no se duplique si la URL ya es completa.
    let cleanPath = url;
    if (url.startsWith('/uploads/')) {
        cleanPath = url.substring(9); // Quitamos /uploads/
    } else if (url.startsWith('uploads/')) {
        cleanPath = url.substring(8); // Quitamos uploads/
    }

    // Siempre devolvemos la ruta bajo la carpeta /uploads/ del servidor
    return `${origin}/uploads/${cleanPath}`;
};