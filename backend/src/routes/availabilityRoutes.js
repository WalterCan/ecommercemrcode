const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { checkLicense } = require('../middleware/licenseMiddleware');
const {
    createAvailability,
    getAvailableSlots,
    getMyAvailability,
    deleteAvailability
} = require('../controllers/availabilityController');

// Todas las rutas requieren Licencia Activa + Autenticación
router.use(protect);
router.use(checkLicense);

// Rutas públicas (clientes)
router.get('/', getAvailableSlots); // Ver horarios disponibles

// Rutas de profesional
router.get('/my-slots', getMyAvailability); // Ver mi disponibilidad
router.post('/', createAvailability); // Publicar disponibilidad
router.delete('/:id', deleteAvailability); // Eliminar disponibilidad

module.exports = router;
