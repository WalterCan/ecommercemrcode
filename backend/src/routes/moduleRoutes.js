const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/moduleController');
const { protect } = require('../middleware/authMiddleware');
const { requireModule, requireSuperAdmin, requireAdmin } = require('../middleware/moduleAccess');

// Ruta pública - Ver qué módulos están activos en el sistema
router.get('/active', moduleController.getActiveModules);

// Rutas para Admin y Super Admin (Lectura de catálogo)
router.get('/', protect, requireAdmin, moduleController.listModules);
router.get('/modules', protect, requireAdmin, moduleController.listModules);

// Rutas para Super Admin (Gestión)
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
