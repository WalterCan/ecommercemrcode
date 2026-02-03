const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'holistica_secret_key_2025';

exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);

            req.user = await User.findByPk(decoded.id, {
                attributes: { exclude: ['password'] }
            });

            if (!req.user) {
                return res.status(401).json({ message: 'No autorizado, usuario no encontrado' });
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'No autorizado, token fallido' });
        }
    } else {
        res.status(401).json({ message: 'No autorizado, no hay token' });
    }
};

exports.admin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin')) {
        next();
    } else {
        res.status(401).json({ message: 'No autorizado como administrador' });
    }
};
