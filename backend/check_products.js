require('dotenv').config();
const sequelize = require('./src/config/db');
const Product = require('./src/models/Product');

async function checkProducts() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        const products = await Product.findAll();
        console.log('--- PRODUCTS IN DB ---');
        products.forEach(p => {
            console.log(`ID: ${p.id} | Name: ${p.name}`);
        });
        console.log('----------------------');

    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        await sequelize.close();
    }
}

checkProducts();
