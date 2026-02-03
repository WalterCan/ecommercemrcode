const rateLimit = require('express-rate-limit');

/**
 * Rate Limiter para Login/Autenticación
 * Previene ataques de fuerza bruta
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // 10 intentos por ventana
    message: {
        success: false,
        error: 'Demasiados intentos de inicio de sesión. Por favor, intenta de nuevo en 15 minutos.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate Limiter para creación de pedidos
 * Previene spam de pedidos
 */
const orderLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 10, // 10 pedidos por hora
    message: {
        success: false,
        error: 'Has alcanzado el límite de pedidos por hora. Por favor, intenta más tarde.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate Limiter general para APIs
 * Previene abuso general
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // 100 requests por ventana
    message: {
        success: false,
        error: 'Demasiadas solicitudes. Por favor, intenta de nuevo más tarde.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate Limiter para recuperación de contraseña
 * Previene spam de emails
 */
const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 3, // 3 intentos por hora
    message: {
        success: false,
        error: 'Demasiados intentos de recuperación de contraseña. Por favor, intenta de nuevo en 1 hora.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    authLimiter,
    orderLimiter,
    apiLimiter,
    passwordResetLimiter
};
