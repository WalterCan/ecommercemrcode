const logger = require('../utils/logger');

/**
 * Middleware bypass (Redis eliminado)
 */
const cacheMiddleware = (ttl = 300, keyPrefix = '') => {
    return async (req, res, next) => {
        next();
    };
};

const invalidateCache = async (pattern) => {
    return 0;
};

const invalidateCacheKey = async (key) => {
    return 0;
};

const getCacheStats = async () => {
    return { totalKeys: 0, info: 'Redis disabled' };
};

const clearAllCache = async () => {
    return true;
};

module.exports = {
    cacheMiddleware,
    invalidateCache,
    invalidateCacheKey,
    getCacheStats,
    clearAllCache
};
