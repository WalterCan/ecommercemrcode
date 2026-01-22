const Appointment = require('../models/Appointment');
const TherapyType = require('../models/TherapyType');
const Patient = require('../models/Patient');
const User = require('../models/User');
const { Op } = require('sequelize');

/**
 * Crear bloque de disponibilidad o asignar turno directamente
 */
const createAvailability = async (req, res) => {
    try {
        const { date, time, end_time, therapy_type_id, patient_id, notes, assign_to_patient } = req.body;

        // Validar que end_time > time
        if (time >= end_time) {
            return res.status(400).json({ error: 'La hora de fin debe ser posterior a la hora de inicio' });
        }

        // Verificar solapamiento de horarios
        const overlapping = await Appointment.findOne({
            where: {
                date,
                [Op.or]: [
                    {
                        // Nuevo bloque comienza durante un bloque existente
                        time: { [Op.lte]: time },
                        end_time: { [Op.gt]: time }
                    },
                    {
                        // Nuevo bloque termina durante un bloque existente
                        time: { [Op.lt]: end_time },
                        end_time: { [Op.gte]: end_time }
                    },
                    {
                        // Nuevo bloque contiene un bloque existente
                        time: { [Op.gte]: time },
                        end_time: { [Op.lte]: end_time }
                    }
                ]
            },
            include: [{
                model: TherapyType,
                as: 'therapy',
                where: { user_id: req.user.id },
                required: false
            }]
        });

        if (overlapping) {
            return res.status(400).json({
                error: 'Ya existe un turno en ese rango horario',
                overlapping: {
                    date: overlapping.date,
                    time: overlapping.time,
                    end_time: overlapping.end_time
                }
            });
        }

        // Si se asigna a paciente, validar que exista
        if (assign_to_patient && patient_id) {
            const patient = await Patient.findByPk(patient_id);
            if (!patient) {
                return res.status(404).json({ error: 'Paciente no encontrado' });
            }

            // Si se asigna a paciente, debe tener terapia
            if (!therapy_type_id) {
                return res.status(400).json({ error: 'Debe seleccionar una terapia al asignar a un paciente' });
            }

            // Verificar que la terapia pertenece al profesional
            const therapy = await TherapyType.findOne({
                where: { id: therapy_type_id, user_id: req.user.id }
            });

            if (!therapy) {
                return res.status(404).json({ error: 'Tipo de terapia no encontrado' });
            }

            // Crear turno asignado
            const appointment = await Appointment.create({
                date,
                time,
                end_time,
                therapy_type_id,
                patient_id,
                status: 'scheduled',
                notes
            });

            return res.status(201).json(appointment);
        }

        // Crear bloque de disponibilidad pública (sin paciente ni terapia)
        const availability = await Appointment.create({
            date,
            time,
            end_time,
            therapy_type_id: null, // Sin terapia específica
            patient_id: null,
            status: 'available',
            notes: null
        });

        res.status(201).json(availability);
    } catch (error) {
        console.error('Error creating availability:', error);
        res.status(500).json({ error: 'Error al crear disponibilidad' });
    }
};

/**
 * Obtener bloques disponibles (público/cliente)
 */
const getAvailableSlots = async (req, res) => {
    try {
        const { date, therapy_type_id } = req.query;

        const where = {
            status: 'available',
            patient_id: null
        };

        if (date) where.date = date;

        const slots = await Appointment.findAll({
            where,
            order: [['date', 'ASC'], ['time', 'ASC']]
        });

        res.json(slots);
    } catch (error) {
        console.error('Error fetching available slots:', error);
        res.status(500).json({ error: 'Error al cargar horarios disponibles' });
    }
};

/**
 * Obtener mi disponibilidad y turnos (profesional)
 */
const getMyAvailability = async (req, res) => {
    try {
        // Obtener IDs de terapias del profesional
        const therapies = await TherapyType.findAll({
            where: { user_id: req.user.id },
            attributes: ['id']
        });

        const therapyIds = therapies.map(t => t.id);

        const slots = await Appointment.findAll({
            where: {
                [Op.or]: [
                    { therapy_type_id: { [Op.in]: therapyIds } },
                    { therapy_type_id: null } // Bloques sin terapia asignada
                ]
            },
            include: [
                {
                    model: TherapyType,
                    as: 'therapy',
                    attributes: ['name', 'duration', 'price'],
                    required: false
                },
                {
                    model: Patient,
                    as: 'patient',
                    attributes: ['id'],
                    required: false,
                    include: [{
                        model: User,
                        as: 'user',
                        attributes: ['name']
                    }]
                }
            ],
            order: [['date', 'ASC'], ['time', 'ASC']]
        });

        res.json(slots);
    } catch (error) {
        console.error('Error fetching my availability:', error);
        res.status(500).json({ error: 'Error al cargar mi disponibilidad' });
    }
};

/**
 * Eliminar bloque de disponibilidad (profesional)
 */
const deleteAvailability = async (req, res) => {
    try {
        const { id } = req.params;

        const slot = await Appointment.findByPk(id, {
            include: [{
                model: TherapyType,
                as: 'therapy',
                required: false
            }]
        });

        if (!slot) {
            return res.status(404).json({ error: 'Bloque no encontrado' });
        }

        // Verificar que el bloque pertenece al profesional
        if (slot.therapy && slot.therapy.user_id !== req.user.id) {
            return res.status(403).json({ error: 'No autorizado' });
        }

        // No permitir eliminar turnos ya reservados por clientes
        if (slot.status === 'scheduled' && slot.patient_id) {
            return res.status(400).json({ error: 'No se puede eliminar un turno ya reservado. Debe cancelarlo primero.' });
        }

        await slot.destroy();
        res.json({ message: 'Disponibilidad eliminada exitosamente' });
    } catch (error) {
        console.error('Error deleting availability:', error);
        res.status(500).json({ error: 'Error al eliminar disponibilidad' });
    }
};

module.exports = {
    createAvailability,
    getAvailableSlots,
    getMyAvailability,
    deleteAvailability
};
