const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/general', protect, admin, statsController.getGeneralStats);
router.get('/sales-chart', protect, admin, statsController.getSalesChart);
router.get('/top-products', protect, admin, statsController.getTopProducts);
router.get('/recent-orders', protect, admin, statsController.getRecentOrders);
router.get('/category-stats', protect, admin, statsController.getCategoryStats);

// Estadísticas de Terapias
router.get('/therapy-stats', protect, admin, statsController.getTherapyStats);
router.get('/therapy-sales-chart', protect, admin, statsController.getTherapySalesChart);

module.exports = router;
