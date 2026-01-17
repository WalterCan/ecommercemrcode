const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');

/**
 * GET /api/reviews/product/:productId
 * Obtener reseñas aprobadas de un producto
 */
router.get('/product/:productId', async (req, res) => {
    try {
        const reviews = await Review.findAll({
            where: {
                product_id: req.params.productId,
                is_approved: true
            },
            order: [['created_at', 'DESC']]
        });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener reseñas' });
    }
});

/**
 * POST /api/reviews
 * Crear una nueva reseña (pendiente de aprobación)
 */
router.post('/', async (req, res) => {
    try {
        const { product_id, customer_name, rating, comment } = req.body;
        const review = await Review.create({
            product_id,
            customer_name,
            rating,
            comment,
            is_approved: false
        });
        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ error: 'Error al enviar reseña' });
    }
});

/**
 * GET /api/reviews/admin (solo admin)
 * Listar todas las reseñas para moderación
 */
router.get('/admin', async (req, res) => {
    try {
        const reviews = await Review.findAll({
            include: [{ model: Product, as: 'product', attributes: ['name'] }],
            order: [['created_at', 'DESC']]
        });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener reseñas para admin' });
    }
});

/**
 * PUT /api/reviews/:id/approve
 * Aprobar una reseña
 */
router.put('/:id/approve', async (req, res) => {
    try {
        const review = await Review.findByPk(req.params.id);
        if (!review) return res.status(404).json({ error: 'Reseña no encontrada' });

        review.is_approved = true;
        await review.save();
        res.json({ success: true, message: 'Reseña aprobada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al aprobar reseña' });
    }
});

/**
 * DELETE /api/reviews/:id
 * Eliminar una reseña
 */
router.delete('/:id', async (req, res) => {
    try {
        const review = await Review.findByPk(req.params.id);
        if (!review) return res.status(404).json({ error: 'Reseña no encontrada' });

        await review.destroy();
        res.json({ success: true, message: 'Reseña eliminada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar reseña' });
    }
});

module.exports = router;
