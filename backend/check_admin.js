const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const User = require('./src/models/User');
const sequelize = require('./src/config/db');

// Force connection settings for local check against Docker mapped port
sequelize.connectionManager.config.host = 'localhost';
sequelize.connectionManager.config.port = 3308;
// Also update the options object just in case (Sequelize versions vary on where they look)
sequelize.options.host = 'localhost';
sequelize.options.port = 3308;

async function check() {
    try {
        console.log('Connecting to database at localhost:3308...');
        await sequelize.authenticate();
        console.log('Database connected successfully.');

        const user = await User.findOne({ where: { email: 'admin@tiendaholistica.com' } });
        if (user) {
            console.log('User FOUND:', user.email);
            console.log('ID:', user.id);
            // Verify if the default password works
            const bcrypt = require('bcrypt');
            const match = await bcrypt.compare('admin_password_2025', user.password);
            console.log('Password "admin_password_2025" matches:', match);
        } else {
            console.log('User NOT FOUND');
        }
    } catch (e) {
        console.error('Error:', e);
        console.error('Config used:', sequelize.config);
    } finally {
        await sequelize.close();
    }
}

check();
