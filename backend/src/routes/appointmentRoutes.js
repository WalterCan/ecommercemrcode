const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { checkLicense } = require('../middleware/licenseMiddleware');
const { requireModule } = require('../middleware/moduleAccess'); // [NEW] Módulos
const { getAppointments, createAppointment, updateAppointmentStatus, getMyAppointments, getAvailability, cancelClientAppointment, rescheduleAppointment, bookAppointment, confirmAppointment, markBalanceAsPaid } = require('../controllers/appointmentController');

// Rutas Públicas (sin auth)
router.get('/availability', getAvailability); // Público/Cliente: Ver ocupación
router.put('/:id/confirm', confirmAppointment); // Permitir confirmación pública (por link)

// Todas las rutas siguientes requieren Licencia Activa + Autenticación
router.use(protect);
router.use(checkLicense);

// Rutas de Cliente - Requieren módulo 'appointments'
router.get('/my-appointments', requireModule('appointments'), getMyAppointments); // Cliente: Ver sus turnos
router.put('/my-appointments/:id/cancel', requireModule('appointments'), cancelClientAppointment); // Cliente: Cancelar turno
router.put('/my-appointments/:id/reschedule', requireModule('appointments'), rescheduleAppointment); // Cliente: Reprogramar turno
router.post('/book', requireModule('appointments'), bookAppointment); // Cliente: Reservar un horario disponible

// Rutas de Admin
router.get('/', admin, getAppointments); // Admin: Ver agenda completa
router.post('/', createAppointment); // Cliente/Admin: Reservar turno
router.put('/:id', admin, updateAppointmentStatus); // Admin: Actualizar estado
router.put('/:id/pay-balance', admin, markBalanceAsPaid);

module.exports = router;
