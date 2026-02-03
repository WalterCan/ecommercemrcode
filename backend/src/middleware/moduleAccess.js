const Module = require('../models/Module');
const User = require('../models/User');
const UserModule = require('../models/UserModule');

/**
 * Middleware para verificar si el usuario tiene acceso a un módulo específico
 * @param {string} moduleCode - Código del módulo requerido (ej: 'appointments', 'patients')
 */
const requireModule = (moduleCode) => {
    return async (req, res, next) => {
        try {
            // Super Admin tiene acceso a todo
            if (req.user && req.user.role === 'super_admin') {
                return next();
            }

            // Buscar el módulo
            const module = await Module.findOne({
                where: {
                    code: moduleCode,
                    is_active: true
                }
            });

            if (!module) {
                return res.status(500).json({
                    error: 'Módulo no configurado',
                    message: `El módulo "${moduleCode}" no está disponible en el sistema`
                });
            }

            // Verificar si el usuario tiene el módulo habilitado
            const userModule = await UserModule.findOne({
                where: {
                    user_id: req.user.id,
                    module_id: module.id,
                    enabled: true
                }
            });

            if (!userModule) {
                return res.status(403).json({
                    error: 'Módulo no disponible',
                    message: `No tienes acceso al módulo "${module.name}". Contacta al administrador.`,
                    module_code: moduleCode,
                    module_name: module.name
                });
            }

            // Usuario tiene acceso
            next();
        } catch (error) {
            console.error('Error en requireModule middleware:', error);
            res.status(500).json({
                error: 'Error verificando permisos',
                message: error.message
            });
        }
    };
};

/**
 * Middleware para verificar si el usuario es Super Admin
 */
const requireSuperAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'No autenticado',
            message: 'Debes iniciar sesión'
        });
    }

    if (req.user.role !== 'super_admin') {
        return res.status(403).json({
            error: 'Acceso denegado',
            message: 'Solo Super Administradores pueden acceder a esta funcionalidad'
        });
    }

    next();
};

module.exports = {
    requireModule,
    requireSuperAdmin
};
