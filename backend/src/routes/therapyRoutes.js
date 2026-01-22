const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { checkLicense } = require('../middleware/licenseMiddleware');
const {
    createTherapy,
    getTherapies,
    getMyTherapies,
    updateTherapy,
    deleteTherapy
} = require('../controllers/therapyController');

// Todas las rutas requieren Licencia Activa + Autenticación
router.use(protect);
router.use(checkLicense);

// Rutas públicas (autenticadas)
router.get('/', getTherapies); // Ver todas las terapias activas

// Rutas de profesional
router.get('/my-therapies', getMyTherapies); // Ver mis terapias
router.post('/', createTherapy); // Crear terapia
router.put('/:id', updateTherapy); // Actualizar terapia
router.delete('/:id', deleteTherapy); // Eliminar terapia

module.exports = router;
