const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { checkLicense } = require('../middleware/licenseMiddleware');
const reminderService = require('../services/reminderService');

// Todas las rutas requieren autenticación y licencia
router.use(protect);
router.use(checkLicense);

/**
 * POST /api/reminders/send
 * Enviar recordatorios manualmente (solo admin)
 */
router.post('/send', admin, async (req, res) => {
    try {
        console.log('📧 Enviando recordatorios manualmente...');
        const results = await reminderService.sendAllReminders();

        res.json({
            success: true,
            message: 'Recordatorios enviados',
            results
        });
    } catch (error) {
        console.error('Error sending reminders:', error);
        res.status(500).json({
            success: false,
            error: 'Error al enviar recordatorios'
        });
    }
});

/**
 * POST /api/reminders/send-24h
 * Enviar solo recordatorios de 24h (solo admin)
 */
router.post('/send-24h', admin, async (req, res) => {
    try {
        const results = await reminderService.send24HourReminders();
        res.json({
            success: true,
            message: 'Recordatorios de 24h enviados',
            results
        });
    } catch (error) {
        console.error('Error sending 24h reminders:', error);
        res.status(500).json({
            success: false,
            error: 'Error al enviar recordatorios de 24h'
        });
    }
});

/**
 * POST /api/reminders/send-1h
 * Enviar solo recordatorios de 1h (solo admin)
 */
router.post('/send-1h', admin, async (req, res) => {
    try {
        const results = await reminderService.send1HourReminders();
        res.json({
            success: true,
            message: 'Recordatorios de 1h enviados',
            results
        });
    } catch (error) {
        console.error('Error sending 1h reminders:', error);
        res.status(500).json({
            success: false,
            error: 'Error al enviar recordatorios de 1h'
        });
    }
});

/**
 * POST /api/reminders/test-send
 * TESTING: Enviar recordatorios SIN validar ventanas de tiempo
 */
router.post('/test-send', admin, async (req, res) => {
    try {
        console.log('🧪 TEST: Enviando recordatorios sin validar tiempo...');

        const Appointment = require('../models/Appointment');
        const Patient = require('../models/Patient');
        const User = require('../models/User');
        const TherapyType = require('../models/TherapyType');

        // Buscar TODOS los turnos scheduled sin recordatorio
        const appointments = await Appointment.findAll({
            where: {
                status: 'scheduled',
                reminder_24h_sent: false
            },
            include: [
                {
                    model: Patient,
                    as: 'patient',
                    include: [{
                        model: User,
                        as: 'user',
                        attributes: ['name', 'email', 'phone']
                    }]
                },
                {
                    model: TherapyType,
                    as: 'therapy',
                    attributes: ['name', 'duration']
                }
            ]
        });

        console.log(`🧪 Encontrados ${appointments.length} turnos para testing`);

        let sent = 0;
        let errors = 0;

        for (const apt of appointments) {
            try {
                const user = apt.patient?.user;
                if (!user) {
                    console.log(`⚠️ Turno #${apt.id}: Usuario no encontrado`);
                    continue;
                }

                // Enviar email
                if (user.email) {
                    await reminderService.sendReminderEmail(apt, user, '24h');
                }

                // Enviar WhatsApp
                if (user.phone) {
                    await reminderService.sendReminderWhatsApp(apt, user, '24h');
                }

                // Marcar como enviado
                apt.reminder_24h_sent = true;
                apt.reminder_24h_sent_at = new Date();
                await apt.save();

                sent++;
                console.log(`✅ TEST: Recordatorio enviado para turno #${apt.id}`);
            } catch (error) {
                errors++;
                console.error(`❌ TEST: Error en turno #${apt.id}:`, error.message);
            }
        }

        res.json({
            success: true,
            message: 'Recordatorios de prueba enviados',
            results: { sent, errors }
        });
    } catch (error) {
        console.error('Error in test-send:', error);
        res.status(500).json({
            success: false,
            error: 'Error al enviar recordatorios de prueba'
        });
    }
});

module.exports = router;
