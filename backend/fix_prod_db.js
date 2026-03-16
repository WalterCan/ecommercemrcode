const bcrypt = require('bcrypt');
const User = require('./src/models/User');
const Module = require('./src/models/Module');
const UserModule = require('./src/models/UserModule');
const sequelize = require('./src/config/db');

async function fixProductionData() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado a la base de datos');

        // 1. Arreglar Vb26tienda@gmail.com (El Admin Real)
        const realAdminEmail = 'Vb26tienda@gmail.com';
        const realAdminUser = await User.findOne({ where: { email: realAdminEmail } });

        if (realAdminUser) {
            console.log(`Encontrado ${realAdminEmail}, actualizando contraseña...`);
            // Hasheamos la contraseña que estaba en texto plano en la BD
            const hashedPassword = await bcrypt.hash('Palmera1363!', 10);
            await realAdminUser.update({ 
                password: hashedPassword,
                role: 'admin' // Aseguramos que sea admin
            });
            console.log(`✅ Contraseña hasheada y rol asegurado para ${realAdminEmail}`);

            // Asignar todos los módulos activos a este admin para que la web funcione
            console.log('Asignando módulos al administrador...');
            const allModules = await Module.findAll({ where: { is_active: true } });
            
            for (const mod of allModules) {
                await UserModule.findOrCreate({
                    where: { user_id: realAdminUser.id, module_id: mod.id },
                    defaults: { enabled: true }
                });
            }
            console.log('✅ Módulos vinculados exitosamente. ¡Los menús públicos volverán a aparecer!');
        } else {
            console.log(`❌ No se encontró el usuario ${realAdminEmail}`);
        }

        // 2. Arreglar admin@ecommerce.com (Convertirlo en Super Admin seguro)
        const superAdminEmail = 'admin@ecommerce.com';
        const superAdminUser = await User.findOne({ where: { email: superAdminEmail } });

        if (superAdminUser) {
            console.log(`Encontrado ${superAdminEmail}, actualizando credenciales...`);
            // Le ponemos una contraseña conocida
            const superHash = await bcrypt.hash('SuperAdmin2024!', 10);
            await superAdminUser.update({
                password: superHash,
                role: 'super_admin' // Aseguramos que sea super_admin
            });
            console.log(`✅ Contraseña actualizada y rol asegurado para ${superAdminEmail}`);
        }

        console.log('\n=======================================');
        console.log('🎉 REPARACIÓN COMPLETADA 🎉');
        console.log('Tus accesos ahora son:');
        console.log('1. Dueño de la tienda (Admin regular):');
        console.log('   - Correo: Vb26tienda@gmail.com');
        console.log('   - Clave: Palmera1363!');
        console.log('2. Acceso Maestro (Super Admin):');
        console.log('   - Correo: admin@ecommerce.com');
        console.log('   - Clave: SuperAdmin2024!');
        console.log('=======================================');

    } catch (error) {
        console.error('❌ Error general:', error);
    } finally {
        process.exit(0);
    }
}

fixProductionData();
