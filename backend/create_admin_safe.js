const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const User = require('./src/models/User');
const sequelize = require('./src/config/db');

// Force connection settings for local check against Docker mapped port
// Similar to check_admin.js
sequelize.connectionManager.config.host = 'localhost';
sequelize.connectionManager.config.port = 3308;
sequelize.options.host = 'localhost';
sequelize.options.port = 3308;

async function createAdmin() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Database connected.');

        const email = 'admin@tienda.com';
        const password = 'admin123';

        const user = await User.findOne({ where: { email } });
        if (user) {
            console.log('User already exists. No action taken.');
        } else {
            console.log(`Creating user ${email}...`);
            await User.create({
                email,
                password // Will be hashed by the model hook
            });
            console.log('✅ Admin user created successfully.');
        }
    } catch (e) {
        console.error('❌ Error creating admin user:', e);
    } finally {
        await sequelize.close();
    }
}

createAdmin();
