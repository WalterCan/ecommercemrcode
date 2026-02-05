const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const ProductImage = require('../models/ProductImage');
const ProductVariant = require('../models/ProductVariant');
const Category = require('../models/Category');
const { validateProduct } = require('../middleware/validator');
const { protect, admin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configuración de Multer para subir múltiples imágenes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'product-' + uniqueSuffix + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes'));
        }
    }
});

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
            include: [
                { model: Category, as: 'category' },
                { model: ProductImage, as: 'images' },
                { model: ProductVariant, as: 'variants' }
            ]
        });
        if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el producto', error: error.message });
    }
});

const { createProduct, updateProduct } = require('../controllers/productController');

// Creación de Producto
router.post('/', protect, admin, upload.array('images', 5), validateProduct, createProduct);

// Actualización de Producto
router.put('/:id', protect, admin, upload.array('images', 5), validateProduct, updateProduct);

// Eliminación de Producto
router.delete('/:id', protect, admin, async (req, res) => {
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
