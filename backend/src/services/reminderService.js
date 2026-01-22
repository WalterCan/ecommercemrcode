const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const User = require('../models/User');
const TherapyType = require('../models/TherapyType');
const { Op } = require('sequelize');
const { format, parseISO, addHours, subHours } = require('date-fns');
const { es } = require('date-fns/locale');
const emailService = require('./emailService');
const whatsappService = require('./whatsappService');

/**
 * Servicio de Recordatorios Automáticos
 * Envía recordatorios por email y WhatsApp 24h y 1h antes de los turnos
 */
class ReminderService {
    /**
     * Enviar recordatorios de 24 horas
     */
    async send24HourReminders() {
        try {
            console.log('📧 Buscando turnos para recordatorio de 24h...');

            const now = new Date();
            const in24Hours = addHours(now, 24);
            const in23Hours = addHours(now, 23); // Ventana de 1 hora

            // Buscar turnos en las próximas 24 horas que no tengan recordatorio enviado
            const appointments = await Appointment.findAll({
                where: {
                    status: 'scheduled',
                    reminder_24h_sent: false,
                    date: {
                        [Op.between]: [
                            format(in23Hours, 'yyyy-MM-dd'),
                            format(in24Hours, 'yyyy-MM-dd')
                        ]
                    }
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

            console.log(`📊 Encontrados ${appointments.length} turnos para recordatorio de 24h`);

            let sentCount = 0;
            let errorCount = 0;

            for (const apt of appointments) {
                try {
                    // Verificar que tenga fecha y hora válidas
                    const aptDateTime = new Date(`${apt.date}T${apt.time}`);
                    const hoursUntil = (aptDateTime - now) / (1000 * 60 * 60);

                    // Solo enviar si está entre 23 y 25 horas
                    if (hoursUntil < 23 || hoursUntil > 25) {
                        continue;
                    }

                    const patient = apt.patient;
                    const user = patient?.user;

                    if (!user) {
                        console.log(`⚠️ Turno #${apt.id}: Usuario no encontrado`);
                        continue;
                    }

                    // Enviar email
                    if (user.email) {
                        await this.sendReminderEmail(apt, user, '24h');
                    }

                    // Enviar WhatsApp
                    if (user.phone) {
                        await this.sendReminderWhatsApp(apt, user, '24h');
                    }

                    // Marcar como enviado
                    apt.reminder_24h_sent = true;
                    apt.reminder_24h_sent_at = new Date();
                    await apt.save();

                    sentCount++;
                    console.log(`✅ Recordatorio 24h enviado para turno #${apt.id}`);

                } catch (error) {
                    errorCount++;
                    console.error(`❌ Error enviando recordatorio 24h para turno #${apt.id}:`, error.message);
                }
            }

            console.log(`📊 Recordatorios 24h: ${sentCount} enviados, ${errorCount} errores`);
            return { sent: sentCount, errors: errorCount };

        } catch (error) {
            console.error('❌ Error en send24HourReminders:', error);
            return { sent: 0, errors: 1 };
        }
    }

    /**
     * Enviar recordatorios de 1 hora
     */
    async send1HourReminders() {
        try {
            console.log('📧 Buscando turnos para recordatorio de 1h...');

            const now = new Date();
            const in1Hour = addHours(now, 1);
            const in30Min = addHours(now, 0.5); // Ventana de 30 minutos

            // Buscar turnos en la próxima hora que no tengan recordatorio enviado
            const appointments = await Appointment.findAll({
                where: {
                    status: 'scheduled',
                    reminder_1h_sent: false,
                    date: format(now, 'yyyy-MM-dd')
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

            console.log(`📊 Encontrados ${appointments.length} turnos potenciales para recordatorio de 1h`);

            let sentCount = 0;
            let errorCount = 0;

            for (const apt of appointments) {
                try {
                    // Verificar que tenga fecha y hora válidas
                    const aptDateTime = new Date(`${apt.date}T${apt.time}`);
                    const minutesUntil = (aptDateTime - now) / (1000 * 60);

                    // Solo enviar si está entre 30 y 90 minutos
                    if (minutesUntil < 30 || minutesUntil > 90) {
                        continue;
                    }

                    const patient = apt.patient;
                    const user = patient?.user;

                    if (!user) {
                        console.log(`⚠️ Turno #${apt.id}: Usuario no encontrado`);
                        continue;
                    }

                    // Enviar email
                    if (user.email) {
                        await this.sendReminderEmail(apt, user, '1h');
                    }

                    // Enviar WhatsApp
                    if (user.phone) {
                        await this.sendReminderWhatsApp(apt, user, '1h');
                    }

                    // Marcar como enviado
                    apt.reminder_1h_sent = true;
                    apt.reminder_1h_sent_at = new Date();
                    await apt.save();

                    sentCount++;
                    console.log(`✅ Recordatorio 1h enviado para turno #${apt.id}`);

                } catch (error) {
                    errorCount++;
                    console.error(`❌ Error enviando recordatorio 1h para turno #${apt.id}:`, error.message);
                }
            }

            console.log(`📊 Recordatorios 1h: ${sentCount} enviados, ${errorCount} errores`);
            return { sent: sentCount, errors: errorCount };

        } catch (error) {
            console.error('❌ Error en send1HourReminders:', error);
            return { sent: 0, errors: 1 };
        }
    }

    /**
     * Enviar recordatorio por email
     */
    async sendReminderEmail(appointment, user, type) {
        try {
            const aptDate = parseISO(appointment.date);
            const formattedDate = format(aptDate, "EEEE d 'de' MMMM, yyyy", { locale: es });
            const timeRange = `${appointment.time?.substring(0, 5)} - ${appointment.end_time?.substring(0, 5)}`;

            let subject, message;

            if (type === '24h') {
                subject = `Recordatorio: Tu turno de ${appointment.therapy?.name || 'terapia'} mañana`;
                message = `
                    <h2>¡Hola ${user.name}!</h2>
                    <p>Te recordamos que <strong>mañana</strong> tienes tu turno:</p>
                    <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>📅 Fecha:</strong> ${formattedDate}</p>
                        <p style="margin: 5px 0;"><strong>🕐 Hora:</strong> ${timeRange}</p>
                        <p style="margin: 5px 0;"><strong>💆 Terapia:</strong> ${appointment.therapy?.name || 'N/A'}</p>
                        <p style="margin: 5px 0;"><strong>⏱️ Duración:</strong> ${appointment.therapy?.duration || 'N/A'} minutos</p>
                    </div>
                    <p>Si necesitas reprogramar o cancelar, puedes hacerlo desde tu cuenta.</p>
                    <p style="margin-top: 30px;">¡Te esperamos!</p>
                `;
            } else {
                subject = `Tu turno es en 1 hora`;
                message = `
                    <h2>¡Hola ${user.name}!</h2>
                    <p>Tu turno es <strong>en 1 hora</strong>:</p>
                    <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>🕐 Hora:</strong> ${timeRange}</p>
                        <p style="margin: 5px 0;"><strong>💆 Terapia:</strong> ${appointment.therapy?.name || 'N/A'}</p>
                    </div>
                    <p style="margin-top: 30px;">¡Nos vemos pronto!</p>
                `;
            }

            await emailService.sendEmail({
                to: user.email,
                subject,
                html: message
            });
            console.log(`✅ Email ${type} enviado a ${user.email}`);

        } catch (error) {
            console.error(`❌ Error enviando email ${type}:`, error.message);
            throw error;
        }
    }

    /**
     * Enviar recordatorio por WhatsApp
     */
    async sendReminderWhatsApp(appointment, user, type) {
        try {
            const aptDate = parseISO(appointment.date);
            const formattedDate = format(aptDate, "EEEE d 'de' MMMM", { locale: es });
            const timeRange = `${appointment.time?.substring(0, 5)} - ${appointment.end_time?.substring(0, 5)}`;

            let message;

            if (type === '24h') {
                message = `¡Hola ${user.name}! 👋\n\n` +
                    `Te recordamos que *mañana* tienes tu turno:\n\n` +
                    `📅 *${formattedDate}*\n` +
                    `🕐 *${timeRange}*\n` +
                    `💆 *${appointment.therapy?.name || 'Terapia'}*\n\n` +
                    `Si necesitas reprogramar, ingresa a tu cuenta.\n\n` +
                    `¡Nos vemos mañana! ✨`;
            } else {
                message = `¡Hola ${user.name}! 👋\n\n` +
                    `Tu turno es *en 1 hora*:\n\n` +
                    `🕐 *${timeRange}*\n` +
                    `💆 *${appointment.therapy?.name || 'Terapia'}*\n\n` +
                    `¡Nos vemos pronto! ✨`;
            }

            // Enviar WhatsApp usando sendCustomMessage
            const phoneNumber = user.phone.replace(/\D/g, '');
            const result = await whatsappService.sendCustomMessage(phoneNumber, message);

            if (result.success) {
                console.log(`✅ WhatsApp ${type} enviado a ${phoneNumber}`);
            } else {
                console.log(`⚠️ WhatsApp ${type} no enviado: ${result.error}`);
            }

        } catch (error) {
            console.error(`❌ Error enviando WhatsApp ${type}:`, error.message);
            // No lanzar error para que no bloquee el email
        }
    }

    /**
     * Ejecutar todos los recordatorios
     */
    async sendAllReminders() {
        console.log('🔔 Ejecutando servicio de recordatorios...');

        const results24h = await this.send24HourReminders();
        const results1h = await this.send1HourReminders();

        const summary = {
            timestamp: new Date(),
            reminders_24h: results24h,
            reminders_1h: results1h,
            total_sent: results24h.sent + results1h.sent,
            total_errors: results24h.errors + results1h.errors
        };

        console.log('📊 Resumen de recordatorios:', summary);
        return summary;
    }
}

module.exports = new ReminderService();
