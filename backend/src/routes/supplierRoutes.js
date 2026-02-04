const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { protect, admin } = require('../middleware/authMiddleware');

// Todas las rutas de proveedores requieren ser Admin
router.use(protect, admin);

router.get('/', supplierController.getSuppliers);
router.get('/:id', supplierController.getSupplierById);
router.post('/', supplierController.createSupplier);
router.put('/:id', supplierController.updateSupplier);
router.delete('/:id', supplierController.deleteSupplier);

module.exports = router;
