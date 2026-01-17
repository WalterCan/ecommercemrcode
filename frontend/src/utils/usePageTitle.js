import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook personalizado para actualizar el título de la página
 * basado en la configuración del sitio y la ruta actual
 */
const usePageTitle = (settings) => {
    const location = useLocation();

    useEffect(() => {
        const siteName = settings?.site_name || 'Perfumería E-commerce';
        const tagline = settings?.site_tagline || 'Fragancias de Alta Calidad';

        // Mapeo de rutas a títulos específicos
        const routeTitles = {
            '/': 'Inicio',
            '/productos': 'Catálogo',
            '/nosotros': 'Sobre Nosotros',
            '/checkout': 'Finalizar Compra',
            '/perfil': 'Mi Perfil',
            '/login': 'Iniciar Sesión',
            '/registro': 'Crear Cuenta',
            '/admin': 'Panel de Administración',
            '/admin/products': 'Gestión de Productos',
            '/admin/orders': 'Gestión de Pedidos',
            '/admin/categories': 'Gestión de Categorías',
            '/admin/coupons': 'Cupones de Descuento',
            '/admin/reviews': 'Reseñas',
            '/admin/settings': 'Configuración',
            '/admin/stock-alerts': 'Alertas de Stock',
            '/admin/reports': 'Reportes',
            '/admin/whatsapp': 'WhatsApp'
        };

        // Obtener el título de la ruta actual
        let pageTitle = routeTitles[location.pathname];

        // Si no hay título específico, intentar con rutas dinámicas
        if (!pageTitle) {
            if (location.pathname.startsWith('/product/')) {
                pageTitle = 'Detalle de Producto';
            } else if (location.pathname.startsWith('/order-confirmation/')) {
                pageTitle = 'Confirmación de Pedido';
            } else if (location.pathname.startsWith('/admin/products/')) {
                pageTitle = 'Editar Producto';
            } else if (location.pathname.startsWith('/admin/categories/')) {
                pageTitle = 'Editar Categoría';
            } else if (location.pathname.startsWith('/reset-password/')) {
                pageTitle = 'Restablecer Contraseña';
            } else if (location.pathname === '/forgot-password') {
                pageTitle = 'Recuperar Contraseña';
            }
        }

        // Construir el título final
        const finalTitle = pageTitle
            ? `${pageTitle} | ${siteName} | ${tagline}`
            : `${siteName} | ${tagline}`;

        document.title = finalTitle;
    }, [location, settings]);
};

export default usePageTitle;
