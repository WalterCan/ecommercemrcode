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

const upload = require('../middleware/uploadMiddleware');

const { requireModule } = require('../middleware/moduleAccess');

// Ruta pública - Ver todas las terapias activas
router.get('/', getTherapies);

// Rutas protegidas (Requieren autenticación)
router.use(protect);
router.use(checkLicense);
router.use(requireModule('appointments'));

// Rutas de profesional
router.get('/my-therapies', getMyTherapies); // Ver mis terapias
router.post('/', upload.single('icon_image'), createTherapy); // Crear terapia
router.put('/:id', upload.single('icon_image'), updateTherapy); // Actualizar terapia
router.delete('/:id', deleteTherapy); // Eliminar terapia

module.exports = router;
