const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { checkLicense } = require('../middleware/licenseMiddleware');
const { getAppointments, createAppointment, updateAppointmentStatus, getMyAppointments, getAvailability, cancelClientAppointment, rescheduleAppointment, bookAppointment } = require('../controllers/appointmentController');

// Todas las rutas requieren Licencia Activa + Autenticación
router.use(protect);
router.use(checkLicense);

// Rutas
router.get('/my-appointments', getMyAppointments); // Cliente: Ver sus turnos
router.put('/my-appointments/:id/cancel', cancelClientAppointment); // Cliente: Cancelar turno
router.put('/my-appointments/:id/reschedule', rescheduleAppointment); // Cliente: Reprogramar turno
router.post('/book', bookAppointment); // Cliente: Reservar un horario disponible
router.get('/availability', getAvailability); // Público/Cliente: Ver ocupación
router.get('/', admin, getAppointments); // Admin: Ver agenda completa
router.post('/', createAppointment); // Cliente/Admin: Reservar turno
router.put('/:id', admin, updateAppointmentStatus); // Admin: Actualizar estado

module.exports = router;
