const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

// ============================================
// IMPORTACIÓN DE RUTAS
// ============================================
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const whatsappRoutes = require('./routes/whatsappRoutes');
const settingRoutes = require('./routes/settingRoutes');
const couponRoutes = require('./routes/couponRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const userRoutes = require('./routes/userRoutes');
const statsRoutes = require('./routes/statsRoutes'); // Rutas de estadísticas
const passwordRoutes = require('./routes/passwordRoutes');
const reportRoutes = require('./routes/reportRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const patientRoutes = require('./routes/patientRoutes'); // [NEW]
const supplierRoutes = require('./routes/supplierRoutes'); // [NEW] Compras
const purchaseRoutes = require('./routes/purchaseRoutes'); // [NEW] Compras

const app = express();

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
    : ['http://localhost:5173', 'http://localhost:5175', 'http://localhost:5176'];

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
// Ajuste de ruta para uploads (subimos un nivel desde src/app.js hasta root/uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ============================================
// REGISTRO DE RUTAS
// ============================================
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/upload', uploadRoutes); // Rutas de subida de imágenes
app.use('/api/settings', settingRoutes);
app.use('/api/stats', statsRoutes); // Rutas de estadísticas
app.use('/api/coupons', couponRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.api_routes = app.api_routes || {};
app.use('/api/categories', categoryRoutes);
app.use('/api/patients', patientRoutes); // [NEW] Consultorio
app.use('/api/appointments', require('./routes/appointmentRoutes')); // [NEW] Agenda
app.use('/api/therapies', require('./routes/therapyRoutes')); // [NEW] Tipos de Terapia
app.use('/api/availability', require('./routes/availabilityRoutes')); // [NEW] Disponibilidad Horaria
app.use('/api/reminders', require('./routes/reminderRoutes')); // [NEW] Recordatorios Automáticos
app.use('/api/payments', require('./routes/paymentRoutes')); // [NEW] Pagos MercadoPago
app.use('/api/module-management', require('./routes/moduleRoutes'));
app.use('/api/modules', require('./routes/moduleRoutes'));
app.use('/api/audit-logs', require('./routes/auditRoutes')); // [NEW] Auditoría
app.use('/api/suppliers', supplierRoutes); // [NEW] Compras
app.use('/api/purchases', purchaseRoutes); // [NEW] Compras
app.use('/api/contact', require('./routes/contactRoutes')); // [NEW] Contacto Web

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

module.exports = app;
