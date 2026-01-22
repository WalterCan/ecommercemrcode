const TherapyType = require('../models/TherapyType');
const { Op } = require('sequelize');

/**
 * Crear un nuevo tipo de terapia (solo profesionales)
 */
const createTherapy = async (req, res) => {
    try {
        const { name, description, duration, price } = req.body;

        const therapy = await TherapyType.create({
            name,
            description,
            duration: duration || 60,
            price,
            user_id: req.user.id // El profesional logueado
        });

        res.status(201).json(therapy);
    } catch (error) {
        console.error('Error creating therapy:', error);
        res.status(500).json({ error: 'Error al crear tipo de terapia' });
    }
};

/**
 * Obtener todas las terapias activas (público)
 */
const getTherapies = async (req, res) => {
    try {
        const therapies = await TherapyType.findAll({
            where: { active: true },
            attributes: ['id', 'name', 'description', 'duration', 'price'],
            order: [['name', 'ASC']]
        });

        res.json(therapies);
    } catch (error) {
        console.error('Error fetching therapies:', error);
        res.status(500).json({ error: 'Error al cargar terapias' });
    }
};

/**
 * Obtener mis terapias (profesional)
 */
const getMyTherapies = async (req, res) => {
    try {
        const therapies = await TherapyType.findAll({
            where: { user_id: req.user.id },
            order: [['created_at', 'DESC']]
        });

        res.json(therapies);
    } catch (error) {
        console.error('Error fetching my therapies:', error);
        res.status(500).json({ error: 'Error al cargar mis terapias' });
    }
};

/**
 * Actualizar tipo de terapia
 */
const updateTherapy = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, duration, price, active } = req.body;

        const therapy = await TherapyType.findOne({
            where: { id, user_id: req.user.id }
        });

        if (!therapy) {
            return res.status(404).json({ error: 'Terapia no encontrada' });
        }

        await therapy.update({ name, description, duration, price, active });
        res.json(therapy);
    } catch (error) {
        console.error('Error updating therapy:', error);
        res.status(500).json({ error: 'Error al actualizar terapia' });
    }
};

/**
 * Eliminar tipo de terapia
 */
const deleteTherapy = async (req, res) => {
    try {
        const { id } = req.params;

        const therapy = await TherapyType.findOne({
            where: { id, user_id: req.user.id }
        });

        if (!therapy) {
            return res.status(404).json({ error: 'Terapia no encontrada' });
        }

        await therapy.destroy();
        res.json({ message: 'Terapia eliminada exitosamente' });
    } catch (error) {
        console.error('Error deleting therapy:', error);
        res.status(500).json({ error: 'Error al eliminar terapia' });
    }
};

module.exports = {
    createTherapy,
    getTherapies,
    getMyTherapies,
    updateTherapy,
    deleteTherapy
};
