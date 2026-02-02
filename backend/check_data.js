const sequelize = require('./src/config/db');
const Product = require('./src/models/Product');
const TherapyType = require('./src/models/TherapyType');

async function checkData() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB');

        const serviceProducts = await Product.findAll({
            where: { type: 'service' }
        });
        console.log(`Found ${serviceProducts.length} products with type='service'.`);
        if (serviceProducts.length > 0) {
            console.log('Sample:', JSON.stringify(serviceProducts[0].toJSON(), null, 2));
        }

        const therapies = await TherapyType.findAll();
        console.log(`Found ${therapies.length} entries in therapy_types table.`);
        if (therapies.length > 0) {
            console.log('Sample:', JSON.stringify(therapies[0].toJSON(), null, 2));
        }

        const allProducts = await Product.findAll({ attributes: ['id', 'name', 'type'] });
        console.log(`Total Products: ${allProducts.length}`);
        // console.log('Product Types:', allProducts.map(p => `${p.name}: ${p.type}`));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkData();
