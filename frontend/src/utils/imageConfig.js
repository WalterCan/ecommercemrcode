/**
 * Formatea la URL de la imagen para que sea accesible desde el frontend.
 * Funciona tanto en desarrollo local como en producción.
 * 
 * Si la imagen es una ruta local (/uploads), usa el mismo dominio del frontend.
 * Si es una URL externa (http...), la devuelve tal cual.
 */
const getBaseUrl = () => {
    // Si la API tiene un dominio externo o explícito (ej. http://localhost:3000/api), limpiamos la URL
    const apiUrl = import.meta.env.VITE_API_URL || '';
    if (apiUrl && apiUrl.startsWith('http')) {
        return apiUrl.replace(/\/api\/?$/, ''); // Quita /api al final
    }
    
    // Si VITE_API_URL es "/api" (producción o Nginx local unificado), 
    // la base de las imágenes es la misma raíz del navegador (vibrabonito.com.ar)
    return '';
};

export const formatImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/400x400?text=Sin+Imagen';

    // Si ya es una URL externa (http/https), devolverla tal cual
    if (url.startsWith('http')) return url;

    // Limpiar la ruta: quitar /uploads inicial si ya lo trae
    let cleanPath = url;
    if (url.startsWith('/uploads/')) {
        cleanPath = url.substring(9); // Quitamos /uploads/
    } else if (url.startsWith('uploads/')) {
        cleanPath = url.substring(8); // Quitamos uploads/
    }

    // Obtener el dominio base del frontend (mismo dominio para imágenes)
    const baseUrl = getBaseUrl();

    // Devolver la ruta completa bajo /uploads/
    return `${baseUrl}/uploads/${cleanPath}`;
};

/**
 * Versión alternativa que fuerza el origen del window (útil para algunos casos)
 * Útil cuando el sitio está en un CDN y las imágenes en otro servidor
 */
export const formatImageUrlWithOrigin = (url) => {
    if (!url) return 'https://via.placeholder.com/400x400?text=Sin+Imagen';

    if (url.startsWith('http')) return url;

    const origin = typeof window !== 'undefined' ? window.location.origin : getBaseUrl();
    
    let cleanPath = url;
    if (url.startsWith('/uploads/')) {
        cleanPath = url.substring(9);
    } else if (url.startsWith('uploads/')) {
        cleanPath = url.substring(8);
    }

    return `${origin}/uploads/${cleanPath}`;
};
