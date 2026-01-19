const { MercadoPagoConfig, Preference } = require('mercadopago');
const Setting = require('../models/Setting');

/**
 * Servicio de Mercado Pago
 * Maneja la creación de preferencias de pago y consultas
 */

// Función auxiliar para obtener credenciales dinámicas
const getMPClient = async () => {
    try {
        const [accessTokenSet, publicKeySet] = await Promise.all([
            Setting.findOne({ where: { key: 'mercadopago_access_token' } }),
            Setting.findOne({ where: { key: 'mercadopago_public_key' } })
        ]);

        const accessToken = (accessTokenSet && accessTokenSet.value) || process.env.MERCADOPAGO_ACCESS_TOKEN;

        if (!accessToken || accessToken === 'tu_access_token_aqui') {
            throw new Error('Mercado Pago Access Token no configurado');
        }

        return new MercadoPagoConfig({
            accessToken: accessToken
        });
    } catch (error) {
        console.error('Error inicializando cliente MP:', error.message);
        throw error;
    }
};

/**
 * Crear preferencia de pago en Mercado Pago
 * @param {Object} orderData - Datos del pedido
 * @returns {Promise<Object>} - Preferencia creada con init_point
 */
const createPaymentPreference = async (orderData) => {
    try {
        const client = await getMPClient();
        const preference = new Preference(client);

        const { id, items, total, customer_name, customer_email, customer_phone } = orderData;

        // Preparar items para Mercado Pago (SDK v2 híbrido)
        const mpItems = items.map(item => ({
            title: item.name,
            quantity: Number(item.quantity),
            unit_price: parseFloat(item.price), // El error dice que unit_price es necesario
            currency_id: 'ARS'
        }));

        // URLs de retorno
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5175';

        const preferenceData = {
            items: mpItems,
            payer: {
                name: customer_name,
                email: customer_email,
                phone: {
                    number: customer_phone
                }
            },
            backUrls: {
                success: `${baseUrl}/order-confirmation/${id}?status=approved`,
                failure: `${baseUrl}/order-confirmation/${id}?status=rejected`,
                pending: `${baseUrl}/order-confirmation/${id}?status=pending`
            },
            autoReturn: 'approved',
            externalReference: `order_${id}`,
            // Omitimos notificationUrl en local para evitar errores de validación
            statementDescriptor: 'TIENDA HOLISTICA'
        };

        console.log('Sending Preference Data to MP (v2 hybrid):', JSON.stringify(preferenceData, null, 2));
        const response = await preference.create({ body: preferenceData });
        console.log('MP Preference Response:', response.id);

        return {
            preference_id: response.id,
            init_point: response.init_point,
            sandbox_init_point: response.sandbox_init_point
        };
    } catch (error) {
        console.error('Error creating Mercado Pago preference:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error);
        }
        throw new Error('Error al crear preferencia de pago');
    }
};

/**
 * Obtener información de un pago
 * @param {string} paymentId - ID del pago en Mercado Pago
 * @returns {Promise<Object>} - Información del pago
 */
const getPaymentInfo = async (paymentId) => {
    try {
        const client = await getMPClient();
        const { Payment } = require('mercadopago');
        const payment = new Payment(client);
        const paymentInfo = await payment.get({ id: paymentId });
        return paymentInfo;
    } catch (error) {
        console.error('Error getting payment info:', error);
        throw error;
    }
};

module.exports = {
    createPaymentPreference,
    getPaymentInfo
};
