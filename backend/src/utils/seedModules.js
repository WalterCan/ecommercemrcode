const Module = require('../models/Module');

/**
 * Script para crear los módulos iniciales del sistema
 */
async function seedModules() {
    try {
        const modules = [
            {
                code: 'appointments',
                name: 'Sistema de Turnos',
                description: 'Reserva y gestión de citas y turnos',
                icon: '📅',
                is_active: true,
                default_enabled: false
            },
            {
                code: 'web',
                name: 'Sitio Web Institucional',
                description: 'Pestañas de Inicio, Nosotros y Contacto',
                icon: '🌐',
                is_active: true,
                default_enabled: true
            },
            {
                code: 'patients',
                name: 'Gestión de Pacientes',
                description: 'Administración de pacientes (para terapeutas y profesionales)',
                icon: '👥',
                is_active: true,
                default_enabled: false
            },
            {
                code: 'ecommerce',
                name: 'E-commerce',
                description: 'Compras y pedidos de productos',
                icon: '🛒',
                is_active: true,
                default_enabled: true
            },
            {
                code: 'reviews',
                name: 'Sistema de Reseñas',
                description: 'Gestión de valoraciones y comentarios de clientes',
                icon: '⭐',
                is_active: true,
                default_enabled: false
            },
            {
                code: 'coupons',
                name: 'Gestión de Cupones',
                description: 'Creación y administración de cupones de descuento',
                icon: '🎫',
                is_active: true,
                default_enabled: false
            },
            {
                code: 'whatsapp',
                name: 'Integración WhatsApp',
                description: 'Envío de notificaciones y recordatorios por WhatsApp',
                icon: '💬',
                is_active: true,
                default_enabled: false
            },
            {
                code: 'reports',
                name: 'Reportes Avanzados',
                description: 'Estadísticas e informes detallados de ventas y actividad',
                icon: '📊',
                is_active: true,
                default_enabled: false
            },
            {
                code: 'purchases',
                name: 'Gestión de Compras',
                description: 'Control de proveedores, facturas de compra y reabastecimiento de stock',
                icon: '📦',
                is_active: true,
                default_enabled: false
            },
            {
                code: 'settings',
                name: 'Ajustes del Sitio',
                description: 'Gestión de colores, imágenes, logos y configuración general',
                icon: '⚙️',
                is_active: true,
                default_enabled: false
            }
        ];

        for (const mod of modules) {
            const [module, created] = await Module.findOrCreate({
                where: { code: mod.code },
                defaults: mod
            });

            if (created) {
                console.log(`✅ Módulo creado: ${module.name}`);
            } else {
                // Si el módulo ya existe, actualizar el nombre y descripción para corregir posibles errores de codificación
                await module.update({
                    name: mod.name,
                    description: mod.description,
                    icon: mod.icon
                });
                console.log(`ℹ️  Módulo actualizado: ${module.name}`);
            }
        }

        console.log('✅ Módulos del sistema inicializados correctamente');
    } catch (error) {
        console.error('❌ Error al crear módulos:', error);
    }
}

module.exports = { seedModules };
