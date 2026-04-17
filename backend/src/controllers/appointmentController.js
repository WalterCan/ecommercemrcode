const logger = require('../utils/logger');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const User = require('../models/User');
const TherapyType = require('../models/TherapyType');
const { Op } = require('sequelize');
const reminderService = require('../services/reminderService');

// Obtener turnos por rango de fechas (para el calendario)
const getAppointments = async (req, res) => {
    try {
        const { start, end, patient_id } = req.query;
        // Validar fechas
        if (!start || !end) {
            return res.status(400).json({ error: 'Rango de fechas requerido' });
        }

        const where = {
            date: {
                [Op.between]: [start, end]
            }
        };

        if (patient_id) {
            where.patient_id = patient_id;
        }

        const appointments = await Appointment.findAll({
            where,
            include: [
                {
                    model: Patient,
                    as: 'patient',
                    include: [{ model: User, as: 'user', attributes: ['name', 'email', 'phone'] }]
                },
                {
                    model: TherapyType,
                    as: 'therapy',
                    attributes: ['name', 'duration', 'price']
                }
            ],
            order: [['date', 'ASC'], ['time', 'ASC']]
        });

        res.json(appointments);
    } catch (error) {
        logger.error('Error fetching appointments:', error);
        res.status(500).json({ error: 'Error al cargar agenda' });
    }
};

// Obtener disponibilidad (público/protegido) - Solo devuelve horarios ocupados
const getAvailability = async (req, res) => {
    try {
        const { start, end } = req.query;
        if (!start || !end) return res.status(400).json({ error: 'Rango de fechas requerido' });

        const appointments = await Appointment.findAll({
            where: {
                date: { [Op.between]: [start, end] },
                status: { [Op.not]: 'cancelled' }
            },
            attributes: ['date', 'time', 'status'] // Solo devolver fecha y hora ocupada
        });

        res.json(appointments);
    } catch (error) {
        logger.error('Error fetching availability:', error);
        res.status(500).json({ error: 'Error al cargar disponibilidad' });
    }
};

// Obtener turnos del usuario logueado
const getMyAppointments = async (req, res) => {
    try {
        // 1. Buscar el paciente asociado al usuario
        const patient = await Patient.findOne({ where: { user_id: req.user.id } });

        if (!patient) {
            return res.json([]); // No tiene historia clínica, por ende no tiene turnos
        }

        // 2. Buscar turnos de este paciente
        const appointments = await Appointment.findAll({
            where: { patient_id: patient.id },
            include: [
                {
                    model: TherapyType,
                    as: 'therapy',
                    attributes: ['id', 'name', 'duration', 'price']
                }
            ],
            order: [['date', 'DESC'], ['time', 'DESC']]
        });

        res.json(appointments);
    } catch (error) {
        logger.error('Error fetching my appointments:', error);
        res.status(500).json({ error: 'Error al cargar mis turnos' });
    }
};

// Crear un nuevo turno
const createAppointment = async (req, res) => {
    try {
        let { patient_id, product_id, date, time, notes } = req.body;

        // Lógica para asignar paciente si no viene en el body (caso Cliente reservando)
        if (!patient_id && req.user) {
            // Buscar si ya es paciente
            let patient = await Patient.findOne({ where: { user_id: req.user.id } });

            // Si no existe, crearlo automáticamente
            if (!patient) {
                patient = await Patient.create({
                    user_id: req.user.id,
                    // Se pueden agregar más datos predeterminados si es necesario
                });
            }
            patient_id = patient.id;
        }

        if (!patient_id && req.body.status !== 'blocked') {
            return res.status(400).json({ error: 'No se pudo identificar al paciente.' });
        }

        // Validar disponibilidad (simple: si ya existe turno en esa hora exacto)
        // MEJORA: Validar duración del servicio y solapamiento.
        const existing = await Appointment.findOne({
            where: {
                date,
                time,
                status: { [Op.not]: 'cancelled' } // Ignorar cancelados
            }
        });

        if (existing) {
            return res.status(400).json({ error: 'Horario no disponible' });
        }

        // Si es bloqueado, no requiere paciente ni producto
        const appointment = await Appointment.create({
            patient_id: req.body.status === 'blocked' ? null : patient_id, // Si blocked, null.
            product_id: req.body.status === 'blocked' ? null : product_id, // Si blocked, null.
            date,
            time,
            notes,
            status: req.body.status || 'scheduled',
            payment_status: 'pending'
        });

        res.status(201).json({ success: true, appointment });

    } catch (error) {
        logger.error('Error creating appointment:', error);
        res.status(500).json({ error: 'Error al reservar turno' });
    }
};

// Actualizar estado (Completado, Cancelado, etc)
const updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, payment_status, notes, patient_id, product_id, price_amount } = req.body;

        const appointment = await Appointment.findByPk(id);
        if (!appointment) return res.status(404).json({ error: 'Turno no encontrado' });

        if (status) appointment.status = status;
        if (payment_status) appointment.payment_status = payment_status;
        if (notes) appointment.notes = notes;
        if (patient_id !== undefined) appointment.patient_id = patient_id;
        if (product_id !== undefined) appointment.product_id = product_id;

        // Si cambia el servicio, podría cambiar el precio (o se puede enviar explícitamente)
        if (price_amount) appointment.price_amount = price_amount;
        else if (product_id) {
            const therapy = await TherapyType.findByPk(product_id);
            if (therapy) appointment.price_amount = therapy.price;
        }

        await appointment.save();

        res.json({ success: true, appointment });

    } catch (error) {
        logger.error('Error updating appointment:', error);
        res.status(500).json({ error: 'Error al actualizar turno' });
    }
};

// Cancelar turno propio (Cliente)
const cancelClientAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await Appointment.findByPk(id, {
            include: [{ model: Patient, as: 'patient' }]
        });

        if (!appointment) return res.status(404).json({ error: 'Turno no encontrado' });

        if (!appointment.patient) {
            return res.status(403).json({ error: 'No tienes permiso para cancelar este turno' });
        }

        // Verificar que el turno pertenezca al usuario logueado
        if (appointment.patient.user_id !== req.user.id) {
            return res.status(403).json({ error: 'No tienes permiso para cancelar este turno' });
        }

        if (appointment.status === 'cancelled') {
            return res.status(400).json({ error: 'El turno ya está cancelado' });
        }

        // Liberar el horario para que vuelva a estar disponible
        appointment.status = 'available';
        appointment.patient_id = null;
        appointment.therapy_type_id = null;
        appointment.notes = null;
        await appointment.save();

        res.json({ message: 'Turno cancelado y horario liberado', appointment });
    } catch (error) {
        logger.error('Error cancelling appointment:', error);
        res.status(500).json({ error: 'Error al cancelar turno' });
    }
};

// Reprogramar turno propio (Cliente)
const rescheduleAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { new_appointment_id } = req.body;

        if (!new_appointment_id) {
            return res.status(400).json({ error: 'Debe seleccionar un nuevo horario' });
        }

        // Buscar turno actual
        const currentAppointment = await Appointment.findByPk(id, {
            include: [{ model: Patient, as: 'patient' }]
        });

        if (!currentAppointment) {
            return res.status(404).json({ error: 'Turno no encontrado' });
        }

        if (!currentAppointment.patient) {
            return res.status(403).json({ error: 'No tienes permiso para reprogramar este turno' });
        }

        // Verificar que el turno pertenezca al usuario
        if (currentAppointment.patient.user_id !== req.user.id) {
            return res.status(403).json({ error: 'No tienes permiso para reprogramar este turno' });
        }

        // Verificar que el turno no esté cancelado o completado
        if (currentAppointment.status === 'cancelled' || currentAppointment.status === 'completed') {
            return res.status(400).json({ error: 'No se puede reprogramar un turno cancelado o completado' });
        }

        // Buscar nuevo horario
        const newAppointment = await Appointment.findByPk(new_appointment_id);

        if (!newAppointment) {
            return res.status(404).json({ error: 'Nuevo horario no encontrado' });
        }

        // Verificar que el nuevo horario esté disponible
        if (newAppointment.status !== 'available' || newAppointment.patient_id !== null) {
            return res.status(400).json({ error: 'El horario seleccionado no está disponible' });
        }

        // Liberar horario anterior
        const originalTherapyId = currentAppointment.therapy_type_id;
        const originalPatientId = currentAppointment.patient_id;

        currentAppointment.status = 'available';
        currentAppointment.patient_id = null;
        currentAppointment.therapy_type_id = null;
        currentAppointment.notes = null;
        await currentAppointment.save();

        // Asignar nuevo horario
        newAppointment.status = 'scheduled';
        newAppointment.patient_id = originalPatientId;
        newAppointment.therapy_type_id = originalTherapyId;
        newAppointment.notes = `Reprogramado desde ${currentAppointment.date} ${currentAppointment.time}`;
        await newAppointment.save();

        // Cargar datos completos del nuevo turno
        const updatedAppointment = await Appointment.findByPk(newAppointment.id, {
            include: [
                {
                    model: TherapyType,
                    as: 'therapy',
                    attributes: ['id', 'name', 'duration', 'price']
                },
                {
                    model: Patient,
                    as: 'patient',
                    attributes: ['id'],
                    include: [{
                        model: User,
                        as: 'user',
                        attributes: ['name']
                    }]
                }
            ]
        });

        res.json({
            message: 'Turno reprogramado exitosamente',
            appointment: updatedAppointment
        });
    } catch (error) {
        logger.error('Error rescheduling appointment:', error);
        res.status(500).json({ error: 'Error al reprogramar turno' });
    }
}

// Reservar un bloque de disponibilidad (Cliente)
const bookAppointment = async (req, res) => {
    try {
        const { appointment_id, therapy_type_id } = req.body;

        if (!therapy_type_id) {
            return res.status(400).json({ error: 'Debe seleccionar un tipo de terapia' });
        }

        // Buscar el bloque disponible
        const slot = await Appointment.findOne({
            where: {
                id: appointment_id,
                status: 'available',
                patient_id: null
            }
        });

        if (!slot) {
            return res.status(404).json({ error: 'Horario no disponible o ya reservado' });
        }

        // Verificar que la terapia existe
        const therapy = await TherapyType.findByPk(therapy_type_id);
        if (!therapy) {
            return res.status(404).json({ error: 'Tipo de terapia no encontrado' });
        }

        // Buscar o crear paciente
        let patient = await Patient.findOne({ where: { user_id: req.user.id } });

        // Validar campos obligatorios del usuario
        const missingUserFields = {
            name: !req.user.name,
            email: !req.user.email,
            phone: !req.user.phone
        };

        // Validar campos obligatorios del paciente
        const missingPatientFields = {
            dni: !patient?.dni,
            birth_date: !patient?.birth_date
        };

        const hasMissingFields = Object.values(missingUserFields).some(v => v) ||
            Object.values(missingPatientFields).some(v => v);

        if (hasMissingFields) {
            return res.status(400).json({
                error: 'Debes completar tu perfil antes de reservar un turno',
                missingFields: {
                    ...missingUserFields,
                    ...missingPatientFields
                }
            });
        }

        if (!patient) {
            // Esto no debería pasar si llegamos aquí por la validación de arriba, 
            // pero lo dejamos por seguridad o por si en el futuro algunos campos fueran opcionales.
            patient = await Patient.create({
                user_id: req.user.id,
                first_name: req.user.name || 'Cliente',
                last_name: ''
            });
        }

        // Marcar como reservado y asignar terapia
        slot.status = 'scheduled';
        slot.patient_id = patient.id;
        slot.therapy_type_id = therapy_type_id;

        // Asignar datos financieros
        slot.price_amount = therapy.price; // El precio viene del tipo de terapia
        slot.payment_method = req.body.payment_method || 'other';
        slot.payment_status = 'pending';

        await slot.save();

        // Cargar datos completos para respuesta
        const appointment = await Appointment.findByPk(slot.id, {
            include: [
                {
                    model: TherapyType,
                    as: 'therapy',
                    attributes: ['id', 'name', 'duration', 'price']
                },
                {
                    model: Patient,
                    as: 'patient',
                    attributes: ['id'],
                    include: [{
                        model: User,
                        as: 'user',
                        attributes: ['name', 'email', 'phone']
                    }]
                }
            ]
        });

        // Enviar confirmación inmediata (Email + WhatsApp)
        // No esperamos a que termine para no bloquear la respuesta
        reminderService.sendBookingConfirmation(appointment).catch(err =>
            console.error('⚠️ Error enviando confirmación de reserva:', err)
        );

        res.json({ message: 'Turno reservado exitosamente', appointment });
    } catch (error) {
        logger.error('Error booking appointment:', error);
        res.status(500).json({ error: 'Error al reservar turno' });
    }
};

// Confirmar asistencia al turno
const confirmAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        // Opcional: Validar token si se implementa seguridad extra

        const appointment = await Appointment.findByPk(id);

        if (!appointment) {
            return res.status(404).json({ error: 'Turno no encontrado' });
        }

        if (appointment.status !== 'scheduled') {
            return res.status(400).json({
                error: 'No se puede confirmar este turno (estado actual: ' + appointment.status + ')'
            });
        }

        appointment.status = 'confirmed';
        await appointment.save();

        res.json({ message: 'Asistencia confirmada exitosamente', appointment });
    } catch (error) {
        logger.error('Error confirming appointment:', error);
        res.status(500).json({ error: 'Error al confirmar asistencia' });
    }
};

// Registrar pago manual (Parcial o Total)
const markBalanceAsPaid = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, payment_method } = req.body; // Opcional: Monto específico a pagar y método

        const appointment = await Appointment.findByPk(id);

        if (!appointment) return res.status(404).json({ error: 'Turno no encontrado' });

        const price = parseFloat(appointment.price_amount || 0);
        const currentPaid = parseFloat(appointment.paid_amount || 0);
        let newPaid = 0;

        if (amount !== undefined && amount !== null) {
            // Pago parcial o monto específico
            const paymentAmount = parseFloat(amount);
            if (isNaN(paymentAmount) || paymentAmount <= 0) {
                return res.status(400).json({ error: 'Monto inválido' });
            }
            newPaid = currentPaid + paymentAmount;

            // Validar si completó el pago
            appointment.paid_amount = newPaid;
            if (newPaid >= price - 0.01) { // Tolerancia pequeña
                appointment.payment_status = 'paid';
                // Si pagó de más, podríamos ajustarlo o dejarlo así. Lo dejamos así.
            } else {
                appointment.payment_status = 'partial';
            }
        }

        // Actualizar método de pago si se proporciona (útil para registrar cobros manuales)
        if (payment_method) {
            appointment.payment_method = payment_method;
        }

        await appointment.save();

        res.json({
            success: true,
            message: 'Pago registrado exitosamente',
            appointment
        });
    } catch (error) {
        logger.error('Error marking balance as paid:', error);
        res.status(500).json({ error: 'Error al registrar pago' });
    }
};

module.exports = {
    getAppointments,
    getMyAppointments,
    getAvailability,
    createAppointment,
    updateAppointmentStatus,
    cancelClientAppointment,
    rescheduleAppointment,
    bookAppointment,
    confirmAppointment,
    markBalanceAsPaid
};
