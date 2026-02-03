const User = require('./src/models/User');
const bcrypt = require('bcrypt');

/**
 * Script para crear un Super Administrador
 * Ejecutar: node create_super_admin.js
 */
async function createSuperAdmin() {
    try {
        const email = process.env.SUPER_ADMIN_EMAIL || 'superadmin@ecommerce.com';
        const password = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin2024!';
        const name = process.env.SUPER_ADMIN_NAME || 'Super Administrador';

        // Verificar si ya existe
        const existingSuperAdmin = await User.findOne({
            where: { email }
        });

        if (existingSuperAdmin) {
            console.log(`ℹ️  Super Admin ya existe: ${email}`);
            console.log(`   Rol actual: ${existingSuperAdmin.role}`);

            // Si existe pero no es super_admin, actualizar
            if (existingSuperAdmin.role !== 'super_admin') {
                await existingSuperAdmin.update({ role: 'super_admin' });
                console.log(`✅ Usuario actualizado a Super Admin`);
            }
            return;
        }

        // Crear nuevo Super Admin
        // NOTA: No hasheamos manualmente porque el hook beforeCreate del modelo lo hace automáticamente
        const superAdmin = await User.create({
            email,
            password, // Pasar contraseña en texto plano, el hook la hasheará
            name,
            role: 'super_admin'
        });

        console.log('✅ Super Admin creado exitosamente!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`   📧 Email: ${email}`);
        console.log(`   🔑 Contraseña: ${password}`);
        console.log(`   👤 Nombre: ${name}`);
        console.log(`   🎯 Rol: super_admin`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('⚠️  IMPORTANTE: Cambia la contraseña después del primer login');
        console.log('');

    } catch (error) {
        console.error('❌ Error al crear Super Admin:', error);
        process.exit(1);
    }
}

// Si se ejecuta directamente
if (require.main === module) {
    const sequelize = require('./src/config/db');

    sequelize.authenticate()
        .then(() => {
            console.log('✅ Conectado a la base de datos');
            return createSuperAdmin();
        })
        .then(() => {
            console.log('✅ Proceso completado');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Error:', error);
            process.exit(1);
        });
}

module.exports = { createSuperAdmin };
