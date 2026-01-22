const Setting = require('../models/Setting');

/**
 * Middleware para verificar si el usuario tiene una licencia activa
 * para acceder a los módulos Premium (Clínica/Turnos).
 */
const checkLicense = async (req, res, next) => {
    try {
        const licenseSetting = await Setting.findOne({ where: { key: 'license_key' } });

        // Lógica de validación simple (Demo: clave 'CLINIC-PRO-2025' o vacía)
        // En producción, esto debería validar contra un servidor de licencias o usar criptografía.
        const validKey = 'CLINIC-PRO-2025';

        if (!licenseSetting || !licenseSetting.value || licenseSetting.value !== validKey) {
            return res.status(403).json({
                error: 'Módulo no activo',
                message: 'Se requiere una licencia Premium activa para acceder a esta función.'
            });
        }

        next();
    } catch (error) {
        console.error('Error verifying license:', error);
        res.status(500).json({ error: 'Error interno verificando licencia' });
    }
};

module.exports = { checkLicense };
