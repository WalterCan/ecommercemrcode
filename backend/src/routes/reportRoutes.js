const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'holistica_secret_key_2025';

// Middleware de autenticación y admin
const isAdmin = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Autenticación requerida' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Acceso denegado: Se requieren permisos de administrador' });
        }
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido' });
    }
};

router.get('/sales', isAdmin, reportController.getSalesReport);
router.get('/stock', isAdmin, reportController.getStockReport);
router.get('/customers', isAdmin, reportController.getCustomersReport);

module.exports = router;
