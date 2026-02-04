process.env.DB_HOST = 'localhost'; // Force localhost for script
const sequelize = require('../src/config/db');
const Module = require('../src/models/Module');
const User = require('../src/models/User');
const UserModule = require('../src/models/UserModule');

async function checkModules() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected');

        // Check Modules
        const modules = await Module.findAll();
        console.log('\n--- MODULES ---');
        modules.forEach(m => console.log(`${m.id}: ${m.code} (${m.name}) - Active: ${m.is_active}`));

        // Check Users
        const users = await User.findAll({ attributes: ['id', 'name', 'email', 'role'] });
        console.log('\n--- USERS ---');
        users.forEach(u => console.log(`${u.id}: ${u.name} (${u.role})`));

        // Check User Modules
        const userModules = await UserModule.findAll();
        console.log('\n--- USER MODULES ---');
        userModules.forEach(um => console.log(`User ${um.user_id} <-> Module ${um.module_id}: Enabled ${um.enabled}`));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkModules();
