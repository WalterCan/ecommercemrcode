const User = require('../models/User');

/**
 * Crea un usuario administrador por defecto si no existe
 */
const createDefaultAdmin = async () => {
    try {
        // Verificar si ya existe un admin
        const adminExists = await User.findOne({ where: { role: 'admin' } });

        if (adminExists) {
            console.log('✅ Usuario administrador ya existe:', adminExists.email);
            return;
        }

        // Crear admin por defecto (el hook beforeCreate hasheará la contraseña automáticamente)
        const admin = await User.create({
            name: 'Administrador',
            email: 'admin@ecommerce.com',
            password: 'admin123',  // Texto plano - el hook beforeCreate la hasheará
            role: 'admin'
        });

        console.log('✅ Usuario administrador creado exitosamente');
        console.log('📧 Email: admin@ecommerce.com');
        console.log('🔑 Contraseña: admin123');
        console.log('⚠️  IMPORTANTE: Cambia esta contraseña después del primer login');

    } catch (error) {
        console.error('❌ Error al crear usuario administrador:', error.message);
    }
};

module.exports = { createDefaultAdmin };
