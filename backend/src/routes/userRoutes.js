const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const Patient = require('../models/Patient');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'holistica_secret_key_2025';

// Middleware para verificar token de usuario
const authenticateUser = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No autorizado' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Sesión expirada' });
    }
};

// Obtener perfil de usuario
router.get('/profile', authenticateUser, async (req, res) => {
    try {
        const user = await User.findByPk(req.userId, {
            include: [{
                model: Patient,
                as: 'patient',
                attributes: ['dni', 'birth_date', 'emergency_contact', 'observations']
            }]
        });
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        res.json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener perfil' });
    }
});

// Actualizar perfil de usuario
router.put('/profile', authenticateUser, async (req, res) => {
    try {
        const user = await User.findByPk(req.userId);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        const { name, email, phone, address, city, postal_code, dni, birth_date, emergency_contact } = req.body;

        // Actualizar datos de User
        await user.update({
            name,
            email,
            phone,
            address,
            city,
            postal_code
        });

        // Actualizar o crear datos de Patient si se proporcionan
        if (dni || birth_date || emergency_contact) {
            let patient = await Patient.findOne({ where: { user_id: req.userId } });

            if (patient) {
                // Actualizar paciente existente
                await patient.update({
                    dni: dni || patient.dni,
                    birth_date: birth_date || patient.birth_date,
                    emergency_contact: emergency_contact || patient.emergency_contact
                });
            } else {
                // Crear nuevo registro de paciente
                await Patient.create({
                    user_id: req.userId,
                    dni,
                    birth_date,
                    emergency_contact
                });
            }
        }

        // Devolver usuario actualizado con datos de paciente
        const updatedUser = await User.findByPk(req.userId, {
            include: [{
                model: Patient,
                as: 'patient',
                attributes: ['dni', 'birth_date', 'emergency_contact']
            }]
        });

        res.json({ message: 'Perfil actualizado con éxito', user: updatedUser });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Error al actualizar perfil' });
    }
});

// Obtener historial de pedidos del usuario
router.get('/orders', authenticateUser, async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { user_id: req.userId },
            order: [['created_at', 'DESC']]
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener pedidos' });
    }
});

module.exports = router;
