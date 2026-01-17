require('dotenv').config({ path: './backend/.env' });
const { MercadoPagoConfig, Preference } = require('mercadopago');

async function testMP() {
    console.log('Testing with token:', process.env.MP_ACCESS_TOKEN ? 'Token found' : 'Token MISSING');

    try {
        const client = new MercadoPagoConfig({
            accessToken: process.env.MP_ACCESS_TOKEN
        });

        const preference = new Preference(client);

        const response = await preference.create({
            body: {
                items: [
                    {
                        title: 'Test Product',
                        quantity: 1,
                        unit_price: 10,
                        currency_id: 'ARS'
                    }
                ]
            }
        });

        console.log('Preference created successfully!');
        console.log('ID:', response.id);
        console.log('Init Point:', response.init_point);
    } catch (error) {
        console.error('MP Test FAILED:');
        if (error.response) {
            console.error(JSON.stringify(error.response, null, 2));
        } else {
            console.error(error);
        }
    }
}

testMP();
