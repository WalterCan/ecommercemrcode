const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
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
            attributes: { exclude: ['password'] }
        });
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener perfil' });
    }
});

// Actualizar perfil de usuario
router.put('/profile', authenticateUser, async (req, res) => {
    try {
        const user = await User.findByPk(req.userId);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        const { name, phone, address, city, postal_code } = req.body;

        await user.update({
            name,
            phone,
            address,
            city,
            postal_code
        });

        res.json({ message: 'Perfil actualizado con éxito', user });
    } catch (error) {
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
