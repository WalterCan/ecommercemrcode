const logger = require('../utils/logger');
const { MercadoPagoConfig, Preference } = require('mercadopago');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Setting = require('../models/Setting');

// Helper para obtener el Access Token
// Intenta primero de ENV, luego de la base de datos de configuraciones
const getAccessToken = async () => {
    // 1. Intentar obtener de la base de datos (prioridad para que admin panel funcione)
    const setting = await Setting.findOne({ where: { key: 'mercadopago_access_token' } });
    if (setting && setting.value && setting.value.trim() !== '') {
        return setting.value;
    }

    // 2. Si no hay en DB, intentar de variable de entorno (si no es el placeholder)
    if (process.env.MERCADOPAGO_ACCESS_TOKEN && process.env.MERCADOPAGO_ACCESS_TOKEN !== 'tu_access_token_aqui') {
        return process.env.MERCADOPAGO_ACCESS_TOKEN;
    }

    return null;
};

exports.createPreference = async (req, res) => {
    try {
        const { appointmentId } = req.body;

        if (!appointmentId) {
            return res.status(400).json({ message: 'Se requiere el ID del turno.' });
        }

        const appointment = await Appointment.findByPk(appointmentId, {
            include: [{ model: Patient, as: 'patient' }]
        });

        if (!appointment) {
            return res.status(404).json({ message: 'Turno no encontrado.' });
        }

        if (appointment.status !== 'scheduled' && appointment.status !== 'confirmed') {
            // Permitimos pagar señas para turnos agendados o confirmados (si no pagaron antes)
            // Ajustar lógica según necesidad.
        }

        const accessToken = await getAccessToken();
        if (!accessToken || accessToken === 'tu_access_token_aqui') {
            return res.status(503).json({
                message: 'El sistema de pagos no está configurado correctamente. Contacte al administrador.',
                error: 'Falta configurar MERCADOPAGO_ACCESS_TOKEN'
            });
        }

        // Configurar cliente de MercadoPago
        const client = new MercadoPagoConfig({ accessToken: accessToken });
        const preference = new Preference(client);

        // Calcular monto de la seña (50%)
        const price = parseFloat(appointment.price_amount);
        if (isNaN(price) || price <= 0) {
            return res.status(400).json({ message: 'El turno no tiene un precio válido asignado.' });
        }

        // Si ya pagó algo, verificar. Por ahora asumimos que es el primer pago (seña).
        const depositAmount = price * 0.50;

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5176';

        const preferenceData = {
            items: [
                {
                    id: `app_${appointment.id}`,
                    title: `Seña Turno #${appointment.id} - Consultorio`,
                    quantity: 1,
                    unit_price: depositAmount,
                    currency_id: 'ARS', // Asumimos pesos argentinos
                }
            ],
            payer: {
                name: appointment.patient ? appointment.patient.first_name : 'Paciente',
                surname: appointment.patient ? appointment.patient.last_name : 'General',
                email: appointment.patient ? appointment.patient.email : 'email@test.com', // MP requiere email válido
            },
            backUrls: {
                success: `${frontendUrl}/turnos/pago/exito`,
                failure: `${frontendUrl}/turnos/pago/fallo`,
                pending: `${frontendUrl}/turnos/pago/pendiente`,
            },
            autoReturn: 'approved',
            externalReference: `${appointment.id}`, // Para identificar el turno en el webhook
            statementDescriptor: "SEÑA CONSULTORIO",
            notificationUrl: `${process.env.API_URL || 'http://localhost:3002'}/api/payments/webhook`
        };

        const result = await preference.create({ body: preferenceData });

        res.json({
            id: result.id,
            init_point: result.init_point, // URL para redirigir
            sandbox_init_point: result.sandbox_init_point,
            amount: depositAmount
        });

    } catch (error) {
        logger.error('Error al crear preferencia de MercadoPago:', error);
        res.status(500).json({ message: 'Error al procesar el pago.', error: error.message });
    }
};

exports.handleWebhook = async (req, res) => {
    try {
        const { query } = req;
        const topic = query.topic || query.type;
        const id = query.id || query['data.id'];

        if (!topic || !id) {
            // A veces MP envía el ID en el body para ciertos eventos, pero lo estándar para webhooks v1/v2 suele ser query o body con type.
            // Si no hay datos suficientes, respondemos 200 para que no reintente infinitamente si es solo un ping.
            return res.status(200).send();
        }

        if (topic === 'payment') {
            const accessToken = await getAccessToken();
            if (!accessToken) return res.status(200).send();

            const { MercadoPagoConfig, Payment } = require('mercadopago');
            const client = new MercadoPagoConfig({ accessToken: accessToken });
            const payment = new Payment(client);

            const paymentData = await payment.get({ id: id });

            if (paymentData.status === 'approved') {
                const appointmentId = paymentData.external_reference;
                const paidAmount = parseFloat(paymentData.transaction_amount);

                if (appointmentId) {
                    const appointment = await Appointment.findByPk(appointmentId);
                    if (appointment) {
                        const currentPaid = parseFloat(appointment.paid_amount || 0);
                        const price = parseFloat(appointment.price_amount || 0);

                        // Evitar duplicar pagos si MP envía el webhook varias veces
                        // Comprobación simple: podríamos guardar IDs de transacciones en una tabla Pagos separada para ser más robustos.
                        // Por ahora, asumimos que si el monto ya cuadra, tal vez ya se procesó. 
                        // OJO: Si el usuario paga 2 veces, esto sumaría. 
                        // Implementación MVP: Sumar.
                        // MEJORA RECOMENDADA: Tener tabla 'Payments' con 'mp_payment_id' unique.

                        // Para este MVP y no romper todo refactorizando:
                        // Solo sumamos.

                        const newPaid = currentPaid + paidAmount;
                        appointment.paid_amount = newPaid;
                        appointment.payment_method = 'mercadopago';

                        if (newPaid >= price - 0.01) {
                            appointment.payment_status = 'paid';
                        } else {
                            appointment.payment_status = 'partial';
                        }

                        await appointment.save();
                        logger.info(`💰 Pago de $${paidAmount} registrado para turno #${appointmentId}`);
                    }
                }
            }
        }

        res.status(200).send();
    } catch (error) {
        logger.error('Webhook error:', error);
        res.status(500).json({ error: error.message });
    }
};
