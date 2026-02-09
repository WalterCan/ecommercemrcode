const logger = require('../utils/logger');

/**
 * Middleware para logging de requests HTTP
 * Registra método, URL, status code y tiempo de respuesta
 */
const httpLogger = (req, res, next) => {
    const start = Date.now();

    // Capturar el método original res.end
    const originalEnd = res.end;

    // Sobrescribir res.end para capturar cuando la respuesta termina
    res.end = function (...args) {
        const duration = Date.now() - start;
        const { method, originalUrl, ip } = req;
        const { statusCode } = res;

        // Determinar el nivel de log según el status code
        let level = 'http';
        if (statusCode >= 500) {
            level = 'error';
        } else if (statusCode >= 400) {
            level = 'warn';
        }

        // Log del request
        logger.log(level, `${method} ${originalUrl} ${statusCode} - ${duration}ms`, {
            method,
            url: originalUrl,
            statusCode,
            duration: `${duration}ms`,
            ip: ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent') || 'unknown'
        });

        // Llamar al método original
        originalEnd.apply(res, args);
    };

    next();
};

module.exports = httpLogger;
