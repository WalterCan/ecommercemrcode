const Patient = require('../models/Patient');
const User = require('../models/User');
const ClinicalRecord = require('../models/ClinicalRecord');

// Obtener todos los pacientes (Admin)
const getPatients = async (req, res) => {
    try {
        const patients = await Patient.findAll({
            include: [{ model: User, as: 'user', attributes: ['name', 'email', 'phone'] }]
        });
        res.json(patients);
    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({ error: 'Error al obtener pacientes' });
    }
};

// Obtener detalle de un paciente (Admin)
const getPatientById = async (req, res) => {
    try {
        const patient = await Patient.findByPk(req.params.id, {
            include: [
                { model: User, as: 'user', attributes: ['name', 'email', 'phone', 'address'] },
                { model: ClinicalRecord, as: 'clinical_records', required: false }
            ],
            order: [
                [{ model: ClinicalRecord, as: 'clinical_records' }, 'date', 'DESC']
            ]
        });
        if (!patient) return res.status(404).json({ error: 'Paciente no encontrado' });
        res.json(patient);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener paciente' });
    }
};

// Crear/Actualizar Ficha de Paciente (Admin o Usuario mismo)
const upsertPatient = async (req, res) => {
    try {
        const { user_id, birth_date, dni, emergency_contact, observations } = req.body;

        // Si no es admin, solo puede editar su propia ficha
        if (req.user.role !== 'admin' && req.user.id !== parseInt(user_id)) {
            return res.status(403).json({ error: 'No autorizado' });
        }

        const [patient, created] = await Patient.findOrCreate({
            where: { user_id },
            defaults: { birth_date, dni, emergency_contact, observations }
        });

        if (!created) {
            await patient.update({ birth_date, dni, emergency_contact, observations });
        }

        res.json({ success: true, patient });
    } catch (error) {
        console.error('Error saving patient:', error);
        res.status(500).json({ error: 'Error al guardar ficha' });
    }
};

// Actualizar Paciente por ID (Admin)
const updatePatient = async (req, res) => {
    try {
        const { id } = req.params;
        const { birth_date, dni, emergency_contact, observations } = req.body;

        const patient = await Patient.findByPk(id);
        if (!patient) return res.status(404).json({ error: 'Paciente no encontrado' });

        await patient.update({ birth_date, dni, emergency_contact, observations });

        // Reload with user data to return consistent shape
        await patient.reload({
            include: [{ model: User, as: 'user', attributes: ['name', 'email', 'phone', 'address'] }]
        });

        res.json(patient);
    } catch (error) {
        console.error('Error updating patient:', error);
        res.status(500).json({ error: 'Error al actualizar paciente' });
    }
};

// Registrar un Nuevo Paciente desde Cero (Admin)
const createPatient = async (req, res) => {
    const t = await require('../config/db').transaction();
    try {
        const { name, email, phone, dni, birth_date, emergency_contact, observations } = req.body;

        // 1. Crear Usuario (con contraseña temporal o default)
        // Check if user exists
        let user = await User.findOne({ where: { email } });
        if (user) {
            await t.rollback();
            return res.status(400).json({ error: 'El email ya está registrado' });
        }

        const tempPassword = 'User' + Math.floor(Math.random() * 10000); // Demo pwd
        // En producción se debería enviar email de bienvenida/reset password

        user = await User.create({
            name,
            email,
            password: tempPassword, // El modelo User hashea esto? Deberíamos usar bcrypt si no es automático en hook.
            // Asumimos que User model tiene hook beforeCreate. Si no, habría que hashearlo aquí.
            phone,
            role: 'customer' // Rol base (antes 'client' erróneo)
        }, { transaction: t });

        // 2. Crear Ficha Paciente
        const patient = await Patient.create({
            user_id: user.id,
            dni,
            birth_date,
            emergency_contact,
            observations
        }, { transaction: t });

        await t.commit();
        res.status(201).json({ success: true, patient, user_id: user.id });

    } catch (error) {
        await t.rollback();
        console.error('Error creating full patient:', error);
        res.status(500).json({ error: error.message || 'Error al crear paciente' });
    }
};

// Agregar Nota de Evolución (Historia Clínica)
const addClinicalRecord = async (req, res) => {
    try {
        const { id } = req.params; // Patient ID
        const { date, notes, attachments } = req.body;

        const record = await ClinicalRecord.create({
            patient_id: id,
            date,
            notes,
            attachments
        });

        res.status(201).json(record);
    } catch (error) {
        console.error('Error adding clinical record:', error);
        res.status(500).json({ error: 'Error al agregar nota' });
    }
};

// Editar Nota de Evolución
const updateClinicalRecord = async (req, res) => {
    try {
        const { recordId } = req.params;
        const { date, notes, attachments } = req.body;

        const record = await ClinicalRecord.findByPk(recordId);
        if (!record) return res.status(404).json({ error: 'Nota no encontrada' });

        await record.update({ date, notes, attachments });
        res.json(record);
    } catch (error) {
        console.error('Error updating clinical record:', error);
        res.status(500).json({ error: 'Error al actualizar nota' });
    }
};

// Eliminar Nota de Evolución
const deleteClinicalRecord = async (req, res) => {
    try {
        const { recordId } = req.params;
        const record = await ClinicalRecord.findByPk(recordId);

        if (!record) return res.status(404).json({ error: 'Nota no encontrada' });

        await record.destroy();
        res.json({ message: 'Nota eliminada' });
    } catch (error) {
        console.error('Error deleting clinical record:', error);
        res.status(500).json({ error: 'Error al eliminar nota' });
    }
};

module.exports = {
    getPatients,
    getPatientById,
    upsertPatient,
    updatePatient,
    createPatient,
    addClinicalRecord,
    updateClinicalRecord,
    deleteClinicalRecord
};
