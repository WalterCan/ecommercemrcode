const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { checkLicense } = require('../middleware/licenseMiddleware');
const { getAppointments, createAppointment, updateAppointmentStatus, getMyAppointments, getAvailability, cancelClientAppointment, rescheduleAppointment, bookAppointment, confirmAppointment, markBalanceAsPaid } = require('../controllers/appointmentController');

// Rutas Públicas (sin auth)
router.get('/availability', getAvailability); // Público/Cliente: Ver ocupación
router.put('/:id/confirm', confirmAppointment); // Permitir confirmación pública (por link)

// Todas las rutas siguientes requieren Licencia Activa + Autenticación
router.use(protect);
router.use(checkLicense);

// Rutas Protegidas
router.get('/my-appointments', getMyAppointments); // Cliente: Ver sus turnos
router.put('/my-appointments/:id/cancel', cancelClientAppointment); // Cliente: Cancelar turno
router.put('/my-appointments/:id/reschedule', rescheduleAppointment); // Cliente: Reprogramar turno
router.post('/book', bookAppointment); // Cliente: Reservar un horario disponible
router.get('/availability', getAvailability); // Público/Cliente: Ver ocupación
router.put('/:id/confirm', confirmAppointment); // Permitir confirmación pública (por link)
router.get('/', admin, getAppointments); // Admin: Ver agenda completa
router.post('/', createAppointment); // Cliente/Admin: Reservar turno
router.put('/:id', admin, updateAppointmentStatus); // Admin: Actualizar estado
router.put('/:id/pay-balance', admin, markBalanceAsPaid);

module.exports = router;
