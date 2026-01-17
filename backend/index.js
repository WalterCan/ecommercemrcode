const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
const path = require('path');
const sequelize = require('./src/config/db');

// ============================================
// IMPORTACIÓN DE RUTAS
// ============================================
const productRoutes = require('./src/routes/productRoutes');
const authRoutes = require('./src/routes/authRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const whatsappRoutes = require('./src/routes/whatsappRoutes');
const settingRoutes = require('./src/routes/settingRoutes');
const couponRoutes = require('./src/routes/couponRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');
const userRoutes = require('./src/routes/userRoutes');
const passwordRoutes = require('./src/routes/passwordRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');

// ============================================
// IMPORTACIÓN DE MODELOS (para sincronización)
// ============================================
const Category = require('./src/models/Category');
const Product = require('./src/models/Product');
const Order = require('./src/models/Order');
const Setting = require('./src/models/Setting');
const Coupon = require('./src/models/Coupon');
const Review = require('./src/models/Review');

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// MIDDLEWARES
// ============================================
// Seguridad con Helmet
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false // Deshabilitado para desarrollo, habilitar en producción
}));

// CORS configurado
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:5175'];

app.use(cors({
    origin: function (origin, callback) {
        // Permitir requests sin origin (como mobile apps o curl)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================
// REGISTRO DE RUTAS
// ============================================
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/categories', categoryRoutes);
/**
 * ============================================
 * RUTA DE SALUD / PRUEBA
 * ============================================
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Servidor E-commerce Perfumes funcionando',
        timestamp: new Date(),
        services: {
            database: 'MySQL',
            payments: 'MercadoPago',
            notifications: 'WhatsApp'
        }
    });
});

// ============================================
// MANEJADOR DE RUTAS NO ENCONTRADAS
// ============================================
// Mejor práctica - Usar el manejador al final
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Ruta no encontrada',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date()
    });
});

// ============================================
// INICIO DEL SERVIDOR
// ============================================
async function startServer() {
    let connected = false;
    let retries = 5;

    while (!connected && retries > 0) {
        try {
            await sequelize.authenticate();
            console.log('✅ Conexión a MySQL establecida correctamente.');
            connected = true;
        } catch (error) {
            retries--;
            console.error(`❌ Error al conectar con la base de datos (${retries} reintentos restantes):`, error.message);
            if (retries === 0) {
                console.error('❌ No se pudo establecer la conexión tras varios intentos. Saliendo...');
                process.exit(1);
            }
            // Esperar 5 segundos antes de reintentar
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }

    try {
        // ============================================
        // SINCRONIZACIÓN DE MODELOS CON LA BASE DE DATOS
        // ============================================
        await sequelize.sync({ alter: true });
        console.log('✅ Modelos sincronizados con la base de datos.');

        // ============================================
        // INICIAR SERVIDOR HTTP
        // ============================================
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
            console.log('✅ Rutas de Categorías activas');
            console.log('📋 Rutas disponibles:');
            console.log(`   • Health Check: http://localhost:${PORT}/api/health`);
            console.log(`   • Productos: http://localhost:${PORT}/api/products`);
            console.log(`   • Pedidos: http://localhost:${PORT}/api/orders`);
            console.log(`   • WhatsApp: http://localhost:${PORT}/api/whatsapp`);
            console.log(`   • Ajustes: http://localhost:${PORT}/api/settings`);
            console.log('\n✨ Perfumería E-commerce lista para recibir pedidos!');
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
            // Hero Section
            { key: 'hero_title', value: 'Descubre tu fragancia perfecta', description: 'Título principal del Hero' },
            { key: 'hero_subtitle', value: 'Explora nuestra exclusiva colección de perfumes y fragancias de alta calidad para cada ocasión.', description: 'Subtítulo del Hero' },
            { key: 'hero_image_url', value: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=2000', description: 'URL de la imagen de fondo del Hero' },
            { key: 'hero_cta_text', value: 'Ver Catálogo', description: 'Texto del botón principal del Hero' },
            { key: 'hero_cta1_link', value: '/productos', description: 'Enlace del botón principal del Hero' },
            { key: 'hero_cta2_text', value: 'Sobre Nosotros', description: 'Texto del botón secundario del Hero' },
            { key: 'hero_cta2_text', value: 'Sobre Nosotros', description: 'Texto del botón secundario del Hero' },
            { key: 'hero_cta2_link', value: '/nosotros', description: 'Enlace del botón secundario del Hero' },
            // Anuncios y Redes Sociales
            { key: 'announcement_active', value: 'false', description: 'Activar barra de anuncios superior' },
            { key: 'announcement_text', value: '¡Envío gratis en compras superiores a $50.000!', description: 'Texto del anuncio' },
            { key: 'announcement_link', value: '/productos', description: 'Enlace del anuncio' },
            { key: 'social_instagram', value: '', description: 'URL de Instagram' },
            { key: 'social_facebook', value: '', description: 'URL de Facebook' }
        ];

        for (const setting of defaultSettings) {
            await Setting.findOrCreate({
                where: { key: setting.key },
                defaults: setting
            });
        }
        console.log('✅ Configuraciones base verificadas/creadas.');

    } catch (error) {
        console.error('❌ Error durante la sincronización o inicio del servidor:', error);
    }
}

startServer();
