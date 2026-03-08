const Setting = require('../models/Setting');

/**
 * Middleware para verificar si el usuario tiene una licencia activa
 * para acceder a los módulos Premium (Clínica/Turnos).
 */
const checkLicense = async (req, res, next) => {
    try {
        // Super Admin tiene acceso total siempre
        if (req.user && req.user.role === 'super_admin') {
            return next();
        }

        // Para otros usuarios, verificamos si hay una licencia configurada.
        // Si queremos que el sistema de Módulos sea el único control, podríamos incluso quitar esto.
        // Pero lo dejamos como un check global de "SaaS Activo".
        const licenseSetting = await Setting.findOne({ where: { key: 'license_key' } });
        const validKey = 'CLINIC-PRO-2025';

        // Si la clave es válida, adelante.
        if (licenseSetting && licenseSetting.value === validKey) {
            return next();
        }

        // Si no hay clave pero es un Administrador, permitimos el acceso 
        // y dejamos que 'requireModule' haga el filtrado fino por módulo.
        if (req.user && req.user.role === 'admin') {
            return next();
        }

        // De lo contrario, bloqueamos.
        return res.status(403).json({
            error: 'Módulo no activo',
            message: 'Se requiere una licencia Premium activa para acceder a esta función.'
        });
    } catch (error) {
        console.error('Error verifying license:', error);
        res.status(500).json({ error: 'Error interno verificando licencia' });
    }
};

module.exports = { checkLicense };
