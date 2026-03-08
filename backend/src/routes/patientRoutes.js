const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { checkLicense } = require('../middleware/licenseMiddleware');
const {
    getPatients,
    getPatientById,
    upsertPatient,
    createPatient,
    addClinicalRecord,
    updateClinicalRecord,
    deleteClinicalRecord
} = require('../controllers/patientController');

const { requireModule } = require('../middleware/moduleAccess');

// Todas las rutas requieren Liciencia Activa + Autenticación
router.use(protect);
router.use(checkLicense);
router.use(requireModule('patients'));

// Rutas
router.post('/create', admin, (req, res, next) => {
    console.log('Request to /patients/create');
    next();
}, createPatient); // Nuevo Paciente (Nuevo User)

router.get('/', admin, getPatients); // Listar todos (Admin)
router.get('/:id', admin, getPatientById); // Ver detalle (Admin)
router.post('/', upsertPatient); // Crear/Actualizar Ficha (Existente User)
router.put('/:id', admin, require('../controllers/patientController').updatePatient); // Actualizar Detalle (Admin)

// Historia Clínica
router.post('/:id/history', admin, addClinicalRecord); // Agregar nota
router.put('/history/:recordId', admin, updateClinicalRecord); // Editar nota
router.delete('/history/:recordId', admin, deleteClinicalRecord); // Eliminar nota

module.exports = router;
