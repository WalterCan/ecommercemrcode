const app = require('./src/app');
const sequelize = require('./src/config/db');
require('dotenv').config();
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 3001;

// ============================================
// IMPORTACIÓN DE MODELOS (para sincronización)
// ============================================
// Aunque app.js carga rutas y controladores (y por ende modelos), 
// mantenemos esto para asegurar orden de carga de asociaciones si fuera necesario.
const Category = require('./src/models/Category');
const Product = require('./src/models/Product');
const Order = require('./src/models/Order');
const Setting = require('./src/models/Setting');
const Coupon = require('./src/models/Coupon');
const Review = require('./src/models/Review');
const Patient = require('./src/models/Patient');
const Appointment = require('./src/models/Appointment');
const TherapyType = require('./src/models/TherapyType');
const Module = require('./src/models/Module');
const UserModule = require('./src/models/UserModule');
const AuditLog = require('./src/models/AuditLog'); // [NEW] Auditoría

// ============================================
// INICIO DEL SERVIDOR
// ============================================
async function startServer() {
    let connected = false;
    let retries = 5;

    while (!connected && retries > 0) {
        try {
            await sequelize.authenticate();
            logger.info('✅ Conexión a MySQL establecida correctamente.');
            connected = true;
        } catch (error) {
            retries--;
            logger.error(`❌ Error al conectar con la base de datos (${retries} reintentos restantes): ${error.message}`);
            if (retries === 0) {
                logger.error('❌ No se pudo establecer la conexión tras varios intentos. Saliendo...');
                process.exit(1);
            }
            // Esperar 5 segundos antes de reintentar
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }

    try {
        // SINCRONIZACIÓN DE MODELOS CON LA BASE DE DATOS
        // ============================================
        // Sincronizar el resto para crear todas las dependencias
        await sequelize.sync();

        // Sincronizar solo Product con alter para agregar columnas sin romper Categories
        await Product.sync({ alter: true });
        logger.info('✅ Modelos sincronizados con la base de datos.');

        // ============================================
        // INICIAR SERVIDOR HTTP
        // ============================================
        app.listen(PORT, () => {
            logger.info(`🚀 Servidor corriendo en http://localhost:${PORT}`);
            logger.info('✅ Rutas de Categorías activas');
            logger.info('📋 Rutas disponibles:');
            logger.info(`   • Health Check: http://localhost:${PORT}/api/health`);
            logger.info(`   • Productos: http://localhost:${PORT}/api/products`);
            logger.info(`   • Pedidos: http://localhost:${PORT}/api/orders`);
            logger.info(`   • WhatsApp: http://localhost:${PORT}/api/whatsapp`);
            logger.info(`   • Ajustes: http://localhost:${PORT}/api/settings`);
            logger.info('\n✨ Perfumería E-commerce lista para recibir pedidos!');
        });

        // ============================================
        // SEEDING DE CONFIGURACIONES POR DEFECTO
        // ============================================
        const defaultSettings = [
            // Información General del Sitio
            { key: 'site_name', value: 'Perfumería E-commerce', description: 'Nombre del sitio' },
            { key: 'site_tagline', value: 'Fragancias de Alta Calidad', description: 'Eslogan o tagline del sitio' },
            { key: 'site_logo_url', value: '', description: 'URL del logo de la tienda' },
            // Datos Bancarios
            { key: 'bank_name', value: '', description: 'Nombre del Banco' },
            { key: 'bank_account_holder', value: '', description: 'Titular de la cuenta' },
            { key: 'bank_cbu', value: '', description: 'CBU / CVU' },
            { key: 'bank_alias', value: '', description: 'Alias de la cuenta' },
            // WhatsApp
            { key: 'whatsapp_number', value: '', description: 'Número de WhatsApp para pedidos' },
            { key: 'whatsapp_message', value: '¡Hola! Quiero coordinar el pago de mi pedido.', description: 'Mensaje predeterminado de WhatsApp' },
            // Mercado Pago
            { key: 'mercadopago_access_token', value: '', description: 'Mercado Pago Access Token' },
            { key: 'mercadopago_public_key', value: '', description: 'Mercado Pago Public Key' },
            // Hero Section
            { key: 'hero_tagline', value: 'Bienvenido a tu Espacio Sagrado', description: 'Tagline superior del Hero' },
            { key: 'hero_title', value: 'Descubre tu fragancia perfecta', description: 'Título principal del Hero' },
            { key: 'hero_subtitle', value: 'Explora nuestra exclusiva colección de perfumes y fragancias de alta calidad para cada ocasión.', description: 'Subtítulo del Hero' },
            { key: 'hero_image_url', value: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=2000', description: 'URL de la imagen de fondo del Hero' },
            { key: 'hero_cta_text', value: 'Ver Catálogo', description: 'Texto del botón principal del Hero' },
            { key: 'hero_cta1_link', value: '/productos', description: 'Enlace del botón principal del Hero' },
            { key: 'hero_cta2_text', value: 'Sobre Nosotros', description: 'Texto del botón secundario del Hero' },
            { key: 'hero_cta2_link', value: '/nosotros', description: 'Enlace del botón secundario del Hero' },
            // Anuncios y Redes Sociales
            { key: 'announcement_active', value: 'false', description: 'Activar barra de anuncios superior' },
            { key: 'announcement_text', value: '¡Envío gratis en compras superiores a $50.000!', description: 'Texto del anuncio' },
            { key: 'announcement_link', value: '/productos', description: 'Enlace del anuncio' },
            { key: 'social_instagram', value: '', description: 'URL de Instagram' },
            { key: 'social_facebook', value: '', description: 'URL de Facebook' },
            // Colores del Tema
            { key: 'theme_primary_color', value: '#D4A5A5', description: 'Color primario (botones, enlaces)' },
            { key: 'theme_secondary_color', value: '#C9A961', description: 'Color secundario (acentos, destacados)' },
            { key: 'theme_background_color', value: '#FFFBF5', description: 'Color de fondo principal' },
            { key: 'theme_background_secondary', value: '#F7E7CE', description: 'Color de fondo secundario' },
            { key: 'theme_text_primary', value: '#1e293b', description: 'Color de texto principal' },
            { key: 'theme_text_secondary', value: '#64748b', description: 'Color de texto secundario' },
            // Página Nosotros - Hero
            { key: 'about_hero_tagline', value: 'Nuestra Esencia', description: 'Tagline de Nosotros (arriba del título)' },
            { key: 'about_hero_title', value: 'Honramos el equilibrio entre cuerpo y espíritu.', description: 'Título principal de Nosotros' },
            // Página Nosotros - Misión
            { key: 'about_mission_image_url', value: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800', description: 'Imagen de la sección Misión' },
            { key: 'about_mission_title', value: 'Nacimos del Silencio', description: 'Título de la sección Misión' },
            { key: 'about_mission_text', value: 'Tienda Holística surgió como una respuesta a la necesidad de reconectar con lo esencial. En un mundo acelerado, creemos que cada rincón de nuestro hogar puede convertirse en un altar de bienestar.', description: 'Texto de la sección Misión' },
            // Página Nosotros - Propósitos
            { key: 'about_prop_1_title', value: 'Propósito', description: 'Título Propósito 1' },
            { key: 'about_prop_1_text', value: 'Facilitar herramientas sagradas para la meditación y el autoconocimiento.', description: 'Texto Propósito 1' },
            { key: 'about_prop_2_title', value: 'Pureza', description: 'Título Propósito 2' },
            { key: 'about_prop_2_text', value: 'Seleccionamos cada objeto bajo criterios de comercio ético y origen natural.', description: 'Texto Propósito 2' },
            // Página Nosotros - Pilares
            { key: 'about_values_title', value: 'Nuestros Pilares', description: 'Título de la sección Pilares' },
            { key: 'about_values_subtitle', value: '"Lo que es adentro, es afuera. Lo que es arriba, es abajo."', description: 'Subtítulo (frase) de la sección Pilares' },
            { key: 'about_value_1_title', value: 'Respeto a la Tierra', description: 'Título Pilar 1' },
            { key: 'about_value_1_text', value: 'Honramos los ciclos de la naturaleza en cada producto.', description: 'Texto Pilar 1' },
            { key: 'about_value_1_icon', value: '🌱', description: 'Emoji/Icono Pilar 1' },
            { key: 'about_value_2_title', value: 'Intención Sagrada', description: 'Título Pilar 2' },
            { key: 'about_value_2_text', value: 'Cada envío es preparado como un ritual de agradecimiento.', description: 'Texto Pilar 2' },
            { key: 'about_value_2_icon', value: '✨', description: 'Emoji/Icono Pilar 2' },
            { key: 'about_value_3_title', value: 'Comunidad', description: 'Título Pilar 3' },
            { key: 'about_value_3_text', value: 'Creemos en el crecimiento colectivo y la sanación grupal.', description: 'Texto Pilar 3' },
            { key: 'about_value_3_icon', value: '🧘', description: 'Emoji/Icono Pilar 3' },
            // Página Nosotros - CTA
            { key: 'about_cta_title', value: '¿Listo para comenzar tu ritual?', description: 'Título del CTA final' },
            { key: 'about_cta_button_text', value: 'Ver Colección', description: 'Texto del botón del CTA final' },
            { key: 'about_cta_button_link', value: '/productos', description: 'Enlace del botón del CTA final' },
            // Colección de Productos
            { key: 'products_empty_icon', value: '🕯️', description: 'Icono (emoji) cuando no hay productos' },
            { key: 'products_empty_image_url', value: '', description: 'Imagen/SVG cuando no hay productos' },
            { key: 'products_empty_text', value: 'No encontramos objetos para esta vibración actualmente.', description: 'Mensaje cuando no hay productos' },
            { key: 'products_detail_reviews_color', value: '#8A9A5B', description: 'Color de las estrellas de reseñas' },
            // Textos Legales
            { key: 'terms_text', value: 'Aquí van los términos y condiciones de tu tienda. Puedes editarlos desde el panel de administración.', description: 'Texto de Términos y Condiciones' },
            { key: 'privacy_text', value: 'Aquí va la política de privacidad de tu tienda. Puedes editarla desde el panel de administración.', description: 'Texto de Política de Privacidad' },
            // Nosotros - Imágenes de Pilares
            { key: 'about_value_1_image_url', value: '', description: 'Imagen para pilar 1' },
            { key: 'about_value_2_image_url', value: '', description: 'Imagen para pilar 2' },
            { key: 'about_value_3_image_url', value: '', description: 'Imagen para pilar 3' },
            // Licencia (SaaS)
            { key: 'license_key', value: 'CLINIC-PRO-2025', description: 'Clave de licencia para activar módulos Premium (Clínica)' },
            // Envío
            { key: 'shipping_enabled', value: 'false', description: 'Activar cobro de envío' },
            { key: 'shipping_fixed_cost', value: '0', description: 'Costo fijo de envío' },
        ];

        for (const setting of defaultSettings) {
            await Setting.findOrCreate({
                where: { key: setting.key },
                defaults: setting
            });
        }
        logger.info('✅ Configuraciones base verificadas/creadas.');

        // ============================================
        // CREAR USUARIO ADMINISTRADOR POR DEFECTO
        // ============================================
        const { createDefaultAdmin } = require('./src/utils/seedAdmin');
        await createDefaultAdmin();

        // ============================================
        // INICIALIZAR MÓDULOS DEL SISTEMA
        // ============================================
        const { seedModules } = require('./src/utils/seedModules');
        await seedModules();

        // ============================================
        // INICIAR CRON JOB DE RECORDATORIOS
        // ============================================
        if (process.env.ENABLE_REMINDERS !== 'false') {
            require('./src/jobs/reminderCron');
            logger.info('✅ Cron de recordatorios iniciado');
        }

    } catch (error) {
        logger.logError(error, 'Error durante la sincronización o inicio del servidor');
    }
}

startServer();
