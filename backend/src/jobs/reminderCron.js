const cron = require('node-cron');
const reminderService = require('../services/reminderService');

/**
 * Cron Job para Recordatorios Automáticos
 * Se ejecuta cada 15 minutos para verificar y enviar recordatorios
 */

// Ejecutar cada 15 minutos
const schedule = process.env.REMINDER_CRON_SCHEDULE || '*/15 * * * *';

console.log(`⏰ Configurando cron de recordatorios: ${schedule}`);

// Iniciar cron job
const reminderCron = cron.schedule(schedule, async () => {
    console.log('🔔 [CRON] Ejecutando recordatorios automáticos...');
    try {
        await reminderService.sendAllReminders();
    } catch (error) {
        console.error('❌ [CRON] Error en recordatorios:', error);
    }
}, {
    scheduled: true,
    timezone: "America/Argentina/Buenos_Aires" // Ajusta según tu zona horaria
});

console.log('✅ Cron de recordatorios iniciado');

module.exports = reminderCron;
