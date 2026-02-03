const TherapyType = require('../models/TherapyType');
const { Op } = require('sequelize');

/**
 * Crear un nuevo tipo de terapia (solo profesionales)
 */
const createTherapy = async (req, res) => {
    try {
        let { name, description, duration, price, icon, image_url } = req.body;

        // Si viene como multipart con un campo "data" (JSON string)
        if (req.body.data) {
            try {
                const parsed = JSON.parse(req.body.data);
                name = parsed.name;
                description = parsed.description;
                duration = parsed.duration;
                price = parsed.price;
                icon = parsed.icon;
                image_url = parsed.image_url;
            } catch (e) {
                console.error('Error parsing therapy data:', e);
            }
        }

        // Si hay un archivo cargado, actualizar la URL
        if (req.file) {
            image_url = `/uploads/${req.file.filename}`;
        }

        const therapy = await TherapyType.create({
            name,
            description,
            duration: duration || 60,
            price,
            icon: icon || '🧘',
            image_url,
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
            attributes: ['id', 'name', 'description', 'duration', 'price', 'icon', 'image_url'],
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
        const queryOptions = {
            order: [['created_at', 'DESC']]
        };

        // Si no es super admin, filtrar por su ID
        if (req.user.role !== 'super_admin') {
            queryOptions.where = { user_id: req.user.id };
        }

        const therapies = await TherapyType.findAll(queryOptions);

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
        let { name, description, duration, price, active, icon, image_url } = req.body;

        // Si viene como multipart con un campo "data" (JSON string)
        if (req.body.data) {
            try {
                const parsed = JSON.parse(req.body.data);
                name = parsed.name;
                description = parsed.description;
                duration = parsed.duration;
                price = parsed.price;
                active = parsed.active;
                icon = parsed.icon;
                image_url = parsed.image_url;
            } catch (e) {
                console.error('Error parsing therapy data:', e);
            }
        }

        // Si hay un archivo cargado, actualizar la URL
        if (req.file) {
            image_url = `/uploads/${req.file.filename}`;
        }

        const queryParams = { id };
        if (req.user.role !== 'super_admin') {
            queryParams.user_id = req.user.id;
        }

        const therapy = await TherapyType.findOne({
            where: queryParams
        });

        if (!therapy) {
            return res.status(404).json({ error: 'Terapia no encontrada' });
        }

        await therapy.update({ name, description, duration, price, active, icon, image_url });
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

        const queryParams = { id };
        if (req.user.role !== 'super_admin') {
            queryParams.user_id = req.user.id;
        }

        const therapy = await TherapyType.findOne({
            where: queryParams
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
