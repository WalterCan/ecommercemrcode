const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Module = require('../models/Module');
const { validateLogin, validateRegister } = require('../middleware/validator');
const { authLimiter } = require('../middleware/rateLimiter');
const auditService = require('../services/auditService');

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Rutas de Autenticación
 */

// Login de Usuario (Admin o Cliente)
router.post('/login', authLimiter, validateLogin, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscar usuario con sus módulos habilitados
        const user = await User.findOne({
            where: { email },
            include: [{
                model: Module,
                as: 'modules',
                through: {
                    attributes: ['enabled'],
                    where: { enabled: true },
                    required: false
                }
            }]
        });

        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Verificar si el usuario está activo
        if (!user.is_active) {
            return res.status(403).json({ message: 'Esta cuenta ha sido desactivada. Contacta al administrador.' });
        }

        // Verificar contraseña
        const isMatch = await user.validPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Generar JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        // Audit Log
        await auditService.log(req, 'LOGIN', 'User', user.id, { email: user.email, role: user.role });

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                role: user.role,
                address: user.address,
                city: user.city,
                postal_code: user.postal_code,
                modules: user.modules || []
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
});

// Verificar Token (Check Auth)
router.get('/verify', async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No hay token, autorización denegada' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findByPk(decoded.id, {
            attributes: { exclude: ['password'] },
            include: [{
                model: Module,
                as: 'modules',
                through: {
                    attributes: ['enabled'],
                    where: { enabled: true },
                    required: false
                }
            }]
        });

        if (!user) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        if (!user.is_active) {
            return res.status(403).json({ message: 'Cuenta desactivada' });
        }

        res.json({ user });
    } catch (error) {
        res.status(401).json({ message: 'Token no válido' });
    }
});

// Registro de Cliente
router.post('/register', validateRegister, async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Verificar si ya existe
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
        }

        // Crear usuario
        const user = await User.create({
            email,
            password,
            name,
            role: 'customer'
        });

        // Generar JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        // Audit Log
        await auditService.log(req, 'REGISTER', 'User', user.id, { email: user.email, role: user.role });

        res.status(201).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
    }
});

module.exports = router;
