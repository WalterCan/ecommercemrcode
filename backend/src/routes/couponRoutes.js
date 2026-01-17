const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { Op } = require('sequelize');

/**
 * GET /api/coupons
 * Listar todos los cupones (solo admin)
 */
router.get('/', async (req, res) => {
    try {
        const coupons = await Coupon.findAll({
            order: [['created_at', 'DESC']]
        });
        res.json(coupons);
    } catch (error) {
        console.error('Error fetching coupons:', error);
        res.status(500).json({ error: 'Error al obtener cupones' });
    }
});

/**
 * POST /api/coupons
 * Crear un nuevo cupón
 */
router.post('/', async (req, res) => {
    try {
        const { code, discount_type, discount_value, expiry_date, usage_limit } = req.body;

        console.log('--- NEW COUPON REQUEST ---', req.body);

        // Limpieza adicional en el backend
        const coupon = await Coupon.create({
            code: code.trim().toUpperCase(),
            discount_type,
            discount_value: parseFloat(discount_value),
            expiry_date: expiry_date || null,
            usage_limit: (usage_limit && usage_limit !== '') ? parseInt(usage_limit) : null
        });

        res.status(201).json(coupon);
    } catch (error) {
        console.error('CRITICAL: Error creating coupon:', error);
        res.status(500).json({
            error: 'Error al crear cupón',
            details: error.message
        });
    }
});

/**
 * POST /api/coupons/validate
 * Validar un cupón y obtener su valor de descuento
 */
router.post('/validate', async (req, res) => {
    try {
        const { code } = req.body;
        const coupon = await Coupon.findOne({
            where: {
                code: code.toUpperCase(),
                is_active: true,
                [Op.or]: [
                    { expiry_date: null },
                    { expiry_date: { [Op.gt]: new Date() } }
                ]
            }
        });

        if (!coupon) {
            return res.status(404).json({ error: 'Cupón no válido o expirado' });
        }

        if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
            return res.status(400).json({ error: 'Este cupón ha alcanzado su límite de uso' });
        }

        res.json({
            success: true,
            code: coupon.code,
            discount_type: coupon.discount_type,
            discount_value: coupon.discount_value
        });
    } catch (error) {
        console.error('Error validating coupon:', error);
        res.status(500).json({ error: 'Error al validar cupón' });
    }
});

/**
 * DELETE /api/coupons/:id
 * Eliminar (o desactivar) un cupón
 */
router.delete('/:id', async (req, res) => {
    try {
        const coupon = await Coupon.findByPk(req.params.id);
        if (!coupon) return res.status(404).json({ error: 'Cupón no encontrado' });

        await coupon.destroy();
        res.json({ success: true, message: 'Cupón eliminado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar cupón' });
    }
});

module.exports = router;
