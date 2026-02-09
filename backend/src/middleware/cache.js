const redis = require('../config/redis');
const logger = require('../utils/logger');

/**
 * Middleware de cache para rutas GET
 * @param {number} ttl - Time to live en segundos (default: 5 minutos)
 * @param {string} keyPrefix - Prefijo personalizado para la key (opcional)
 */
const cacheMiddleware = (ttl = 300, keyPrefix = '') => {
    return async (req, res, next) => {
        // Solo cachear GET requests
        if (req.method !== 'GET') {
            return next();
        }

        // Generar key de cache
        const baseKey = keyPrefix || req.originalUrl || req.url;
        const cacheKey = `cache:${baseKey}`;

        try {
            // Intentar obtener del cache
            const cachedData = await redis.get(cacheKey);

            if (cachedData) {
                logger.http(`Cache HIT: ${cacheKey}`);
                return res.json(JSON.parse(cachedData));
            }

            logger.http(`Cache MISS: ${cacheKey}`);

            // Interceptar res.json para cachear la respuesta
            const originalJson = res.json.bind(res);
            res.json = (data) => {
                // Solo cachear respuestas exitosas
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    redis.setex(cacheKey, ttl, JSON.stringify(data))
                        .catch(err => logger.error(`Error cacheando ${cacheKey}:`, err));
                }
                return originalJson(data);
            };

            next();
        } catch (error) {
            logger.error('Error en cache middleware:', error);
            // Si Redis falla, continuar sin cache
            next();
        }
    };
};

/**
 * Invalidar cache por patrón
 * @param {string} pattern - Patrón de keys a eliminar (ej: 'cache:/api/products*')
 */
const invalidateCache = async (pattern) => {
    try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(...keys);
            logger.info(`Cache invalidado: ${keys.length} key(s) - ${pattern}`);
            return keys.length;
        }
        return 0;
    } catch (error) {
        logger.error(`Error invalidando cache ${pattern}:`, error);
        return 0;
    }
};

/**
 * Invalidar cache específico
 * @param {string} key - Key exacta a eliminar
 */
const invalidateCacheKey = async (key) => {
    try {
        const result = await redis.del(key);
        if (result > 0) {
            logger.info(`Cache key eliminada: ${key}`);
        }
        return result;
    } catch (error) {
        logger.error(`Error eliminando cache key ${key}:`, error);
        return 0;
    }
};

/**
 * Obtener estadísticas de cache
 */
const getCacheStats = async () => {
    try {
        const info = await redis.info('stats');
        const keys = await redis.dbsize();

        return {
            totalKeys: keys,
            info: info
        };
    } catch (error) {
        logger.error('Error obteniendo estadísticas de cache:', error);
        return null;
    }
};

/**
 * Limpiar todo el cache
 */
const clearAllCache = async () => {
    try {
        await redis.flushdb();
        logger.warn('⚠️  Todo el cache ha sido limpiado');
        return true;
    } catch (error) {
        logger.error('Error limpiando cache:', error);
        return false;
    }
};

module.exports = {
    cacheMiddleware,
    invalidateCache,
    invalidateCacheKey,
    getCacheStats,
    clearAllCache
};
