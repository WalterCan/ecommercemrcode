/**
 * Formatea la URL de la imagen para que sea accesible desde el frontend.
 * Si la imagen es una ruta local (comienza con /uploads), le añade la URL del backend.
 * Si es una URL externa (http...), la devuelve tal cual.
 */
export const formatImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/400x400?text=Sin+Imagen';

    if (url.startsWith('http')) return url;

    // Si estamos en el navegador, usamos la raíz actual del dominio
    // Esto asegura que en producción use https://vibrabonito.com.ar/uploads/...
    // y en desarrollo siga funcionando localmente.
    const origin = typeof window !== 'undefined' 
        ? window.location.origin 
        : (import.meta.env.VITE_API_URL || 'http://localhost:3002/api').replace(/\/api$/, '');

    // Nos aseguramos de que la url de la imagen empiece con /
    const cleanPath = url.startsWith('/') ? url : `/${url}`;

    return `${origin}${cleanPath}`;
};