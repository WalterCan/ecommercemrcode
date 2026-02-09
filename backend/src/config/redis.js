const Redis = require('ioredis');
const logger = require('../utils/logger');

/**
 * Configuración de Redis para caché
 */
const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || null,
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: false
});

// Event listeners
redis.on('connect', () => {
    logger.info('🔄 Conectando a Redis...');
});

redis.on('ready', () => {
    logger.info('✅ Redis conectado y listo');
});

redis.on('error', (err) => {
    logger.error(`❌ Error de Redis: ${err.message}`);
});

redis.on('close', () => {
    logger.warn('⚠️  Conexión a Redis cerrada');
});

redis.on('reconnecting', () => {
    logger.warn('🔄 Reconectando a Redis...');
});

module.exports = redis;
