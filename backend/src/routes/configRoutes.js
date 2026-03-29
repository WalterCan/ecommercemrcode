const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');

/**
 * @route   GET /api/config/public-keys
 * @desc    Obtener llaves públicas (Mercado Pago, etc.) desde la base de datos
 * @access  Public
 */
router.get('/public-keys', async (req, res) => {
    try {
        const publicKey = await Setting.findOne({ where: { key: 'mercadopago_public_key' } });
        
        res.json({
            mercadopago_public_key: publicKey ? publicKey.value : null
        });
    } catch (error) {
        console.error('Error al obtener llaves públicas:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

module.exports = router;
