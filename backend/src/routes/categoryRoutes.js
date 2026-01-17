const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { validateCategory } = require('../middleware/validator');

/**
 * Rutas de Categorías (/api/categories)
 */

// Obtener todas las categorías
router.get('/', async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener categorías', error: error.message });
    }
});

// Obtener una categoría por ID
router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) return res.status(404).json({ message: 'Categoría no encontrada' });
        res.json(category);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener categoría', error: error.message });
    }
});

// Crear Categoría
router.post('/', validateCategory, async (req, res) => {
    try {
        const category = await Category.create(req.body);
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear categoría', error: error.message });
    }
});

// Actualizar Categoría
router.put('/:id', validateCategory, async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) return res.status(404).json({ message: 'Categoría no encontrada' });

        await category.update(req.body);
        res.json(category);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar categoría', error: error.message });
    }
});

// Eliminar Categoría
router.delete('/:id', async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) return res.status(404).json({ message: 'Categoría no encontrada' });

        await category.destroy();
        res.json({ message: 'Categoría eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar categoría', error: error.message });
    }
});

module.exports = router;
