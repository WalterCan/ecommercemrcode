const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const { validateProduct } = require('../middleware/validator');

/**
 * Rutas de Productos
 */

// Obtener todos los productos (con sus categorías)
router.get('/', async (req, res) => {
    try {
        const products = await Product.findAll({
            include: [{ model: Category, as: 'category' }]
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener productos', error: error.message });
    }
});

// (Rutas de categorías movidas a categoryRoutes.js)

// Obtener productos destacados
router.get('/featured', async (req, res) => {
    try {
        const products = await Product.findAll({
            where: { featured: true },
            include: [{ model: Category, as: 'category' }]
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener productos destacados', error: error.message });
    }
});

// Obtener alertas de stock (productos con stock bajo o crítico)
router.get('/stock-alerts', async (req, res) => {
    try {
        const { Op } = require('sequelize');
        const products = await Product.findAll({
            where: {
                [Op.or]: [
                    { stock: { [Op.lte]: require('sequelize').col('stock_critico') } },
                    { stock: { [Op.lte]: require('sequelize').col('stock_minimo') } }
                ]
            },
            include: [{ model: Category, as: 'category' }],
            order: [['stock', 'ASC']]
        });

        // Clasificar productos por estado
        const alerts = products.map(product => ({
            ...product.toJSON(),
            stockStatus: product.stock <= product.stock_critico ? 'critical' : 'low'
        }));

        res.json(alerts);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener alertas de stock', error: error.message });
    }
});

// Obtener estadísticas de stock
router.get('/stock-stats', async (req, res) => {
    try {
        const { Op } = require('sequelize');

        const allProducts = await Product.findAll();

        const stats = {
            critical: allProducts.filter(p => p.stock <= p.stock_critico).length,
            low: allProducts.filter(p => p.stock > p.stock_critico && p.stock <= p.stock_minimo).length,
            ok: allProducts.filter(p => p.stock > p.stock_minimo).length,
            total: allProducts.length
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener estadísticas de stock', error: error.message });
    }
});

// Obtener un producto por ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: [{ model: Category, as: 'category' }]
        });
        if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el producto', error: error.message });
    }
});

const upload = require('../middleware/uploadMiddleware');

// ... (existing GET routes)

// Creación de Producto
router.post('/', upload.single('image'), validateProduct, async (req, res) => {
    try {
        const productData = req.body;
        if (req.file) {
            productData.image_url = `/uploads/${req.file.filename}`;
        }

        const product = await Product.create(productData);
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear producto', error: error.message });
    }
});

// Actualización de Producto
router.put('/:id', upload.single('image'), validateProduct, async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Producto no encontrado' });

        const productData = req.body;
        if (req.file) {
            productData.image_url = `/uploads/${req.file.filename}`;
        }

        await product.update(productData);
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar producto', error: error.message });
    }
});

// Eliminación de Producto
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Producto no encontrado' });

        await product.destroy();
        res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar producto', error: error.message });
    }
});

// Rutas de Categorías -> Ver categoryRoutes.js

module.exports = router;
