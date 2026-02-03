const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = process.env.NODE_ENV === 'test'
    ? new Sequelize('sqlite::memory:', {
        logging: false,
        define: {
            timestamps: true,
            underscored: true
        }
    })
    : new Sequelize(
        process.env.DB_NAME || 'tienda_holistica',
        process.env.DB_USER || 'root',
        process.env.DB_PASSWORD || 'root_password',
        {
            host: process.env.DB_HOST || 'db_holistica',
            port: process.env.DB_PORT || 3306,
            dialect: 'mysql',
            logging: false,
            define: {
                timestamps: true,
                underscored: true
            }
        }
    );

module.exports = sequelize;
