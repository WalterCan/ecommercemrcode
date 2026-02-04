const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const { protect, admin } = require('../middleware/authMiddleware');

// Todas las rutas de compras requieren ser Admin
router.use(protect, admin);

router.get('/', purchaseController.getPurchases);
router.get('/:id', purchaseController.getPurchaseById);
router.post('/', purchaseController.createPurchase);
router.post('/:id/receive', purchaseController.receivePurchase);
router.post('/:id/cancel', purchaseController.cancelPurchase);

module.exports = router;
