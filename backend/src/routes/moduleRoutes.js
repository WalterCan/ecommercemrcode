const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/moduleController');
const { protect } = require('../middleware/authMiddleware');
const { requireSuperAdmin } = require('../middleware/moduleAccess');

// Rutas para Super Admin
router.get('/modules', protect, requireSuperAdmin, moduleController.listModules);
router.get('/users-with-modules', protect, requireSuperAdmin, moduleController.getAllUsersWithModules);
router.get('/users/:userId/modules', protect, requireSuperAdmin, moduleController.getUserModules);
router.post('/enable', protect, requireSuperAdmin, moduleController.enableModuleForUser);
router.post('/disable', protect, requireSuperAdmin, moduleController.disableModuleForUser);

// Nuevas rutas de gestión de usuarios
router.post('/users', protect, requireSuperAdmin, moduleController.createUser);
router.put('/users/:userId/role', protect, requireSuperAdmin, moduleController.updateUserRole);
router.put('/users/:userId/toggle-status', protect, requireSuperAdmin, moduleController.toggleUserStatus);

// Ruta para que el usuario vea sus propios módulos
router.get('/my-modules', protect, moduleController.getMyModules);

module.exports = router;
