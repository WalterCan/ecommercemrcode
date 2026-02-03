const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditController');
const { protect, admin } = require('../middleware/authMiddleware');

// Solo Super Admin debería ver logs, o Admin General
// Asumimos 'admin' role check es suficiente por ahora, o chequeo de módulo específico
router.get('/', protect, admin, getAuditLogs);

module.exports = router;
