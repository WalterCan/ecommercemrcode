const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { getCacheStats, clearAllCache, invalidateCache } = require('../middleware/cache');
const logger = require('../utils/logger');

/**
 * GET /api/cache/stats
 * Obtener estadísticas del cache (solo admin)
 */
router.get('/stats', protect, admin, async (req, res) => {
    try {
        const stats = await getCacheStats();
        res.json(stats);
    } catch (error) {
        logger.error('Error obteniendo estadísticas de cache:', error);
        res.status(500).json({ message: 'Error al obtener estadísticas' });
    }
});

/**
 * DELETE /api/cache/clear
 * Limpiar todo el cache (solo admin)
 */
router.delete('/clear', protect, admin, async (req, res) => {
    try {
        await clearAllCache();
        res.json({ message: 'Cache limpiado exitosamente' });
    } catch (error) {
        logger.error('Error limpiando cache:', error);
        res.status(500).json({ message: 'Error al limpiar cache' });
    }
});

/**
 * DELETE /api/cache/invalidate
 * Invalidar cache por patrón (solo admin)
 * Body: { pattern: 'cache:/api/products*' }
 */
router.delete('/invalidate', protect, admin, async (req, res) => {
    try {
        const { pattern } = req.body;

        if (!pattern) {
            return res.status(400).json({ message: 'Patrón requerido' });
        }

        const count = await invalidateCache(pattern);
        res.json({
            message: `Cache invalidado: ${count} key(s)`,
            pattern,
            count
        });
    } catch (error) {
        logger.error('Error invalidando cache:', error);
        res.status(500).json({ message: 'Error al invalidar cache' });
    }
});

module.exports = router;
