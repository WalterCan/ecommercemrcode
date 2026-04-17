const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const { validateProduct } = require('../middleware/validator');
const { protect, admin } = require('../middleware/authMiddleware');
const { cacheMiddleware } = require('../middleware/cache');
const multer = require('multer');
const path = require('path');

const {
    getAllProducts,
    getProductById,
    getFeaturedProducts,
    getAllProductsAdmin,
    getProductByIdAdmin,
    createProduct,
    updateProduct,
    updateProductStatus,
    deleteProduct
} = require('../controllers/productController');

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

// --- Rutas Públicas (Solo Activos) ---

// Obtener todos los productos (con sus categorías) - Cache 5 minutos
router.get('/', cacheMiddleware(300), getAllProducts);

// Obtener productos destacados - Cache 15 minutos
router.get('/featured', cacheMiddleware(900), getFeaturedProducts);

// --- Rutas de Stock / Reportes ---
// IMPORTANTE: deben ir ANTES de /:id para que Express no las capture como parámetro

// Obtener alertas de stock (productos con stock bajo o crítico) - Cache 3 minutos
router.get('/stock-alerts', protect, admin, cacheMiddleware(180), async (req, res) => {
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

        const alerts = products.map(product => ({
            ...product.toJSON(),
            stockStatus: product.stock <= product.stock_critico ? 'critical' : 'low'
        }));

        res.json(alerts);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener alertas de stock', error: error.message });
    }
});

// Obtener estadísticas de stock - Cache 3 minutos
router.get('/stock-stats', protect, admin, cacheMiddleware(180), async (req, res) => {
    try {
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

// --- Rutas Admin (Protegidas, Todo el inventario) ---

// Obtener todos los productos administrables (incluye inactivos)
router.get('/admin/all', protect, admin, getAllProductsAdmin);

// Obtener detalle de producto administrable
router.get('/admin/detail/:id', protect, admin, getProductByIdAdmin);

// Obtener un producto por ID - Cache 10 minutos
router.get('/:id', cacheMiddleware(600), getProductById);


// --- CRUD Admin ---

// Creación de Producto
router.post('/', protect, admin, upload.array('images', 5), validateProduct, createProduct);

// Actualización de Producto
router.put('/:id', protect, admin, upload.array('images', 5), validateProduct, updateProduct);

// Actualización de Estado (Toggle Active)
router.patch('/:id/status', protect, admin, updateProductStatus);

// Eliminación de Producto
router.delete('/:id', protect, admin, deleteProduct);


// Rutas de Categorías -> Ver categoryRoutes.js

module.exports = router;
