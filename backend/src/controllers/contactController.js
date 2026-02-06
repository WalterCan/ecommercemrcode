const emailService = require('../services/emailService');
const Setting = require('../models/Setting');

/**
 * Enviar mensaje de contacto
 */
exports.sendContactEmail = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validación básica
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        // Obtener email de destino desde configuración
        const emailSetting = await Setting.findOne({ where: { key: 'contact_email' } });
        const toEmail = emailSetting ? emailSetting.value : process.env.CONTACT_EMAIL || process.env.EMAIL_USER;

        if (!toEmail) {
            console.warn('No contact email configured. Defaulting to sender.');
            // Fallback si no hay configuración: enviar al propio email configurado en el servicio
        }

        const result = await emailService.sendContactMessage({
            to: toEmail,
            name,
            email,
            subject,
            message
        });

        if (result.success) {
            res.status(200).json({ message: 'Mensaje enviado con éxito' });
        } else {
            res.status(500).json({ error: 'Error al enviar el mensaje' });
        }

    } catch (error) {
        console.error('Error in sendContactEmail:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
