const logger = require('../utils/logger');
const Supplier = require('../models/Supplier');

/**
 * Obtener todos los proveedores
 */
exports.getSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.findAll({
            order: [['name', 'ASC']]
        });
        res.json(suppliers);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener proveedores' });
    }
};

/**
 * Obtener un proveedor por ID
 */
exports.getSupplierById = async (req, res) => {
    try {
        const supplier = await Supplier.findByPk(req.params.id);
        if (!supplier) return res.status(404).json({ error: 'Proveedor no encontrado' });
        res.json(supplier);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el proveedor' });
    }
};

/**
 * Crear un nuevo proveedor
 */
exports.createSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.create(req.body);
        res.status(201).json(supplier);
    } catch (error) {
        res.status(400).json({ error: 'Error al crear el proveedor', details: error.message });
    }
};

/**
 * Actualizar un proveedor
 */
exports.updateSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findByPk(req.params.id);
        if (!supplier) return res.status(404).json({ error: 'Proveedor no encontrado' });

        await supplier.update(req.body);
        res.json(supplier);
    } catch (error) {
        res.status(400).json({ error: 'Error al actualizar el proveedor', details: error.message });
    }
};

/**
 * Eliminar (desactivar) un proveedor
 */
exports.deleteSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findByPk(req.params.id);
        if (!supplier) return res.status(404).json({ error: 'Proveedor no encontrado' });

        // Soft delete/desactivación
        await supplier.update({ is_active: false });
        res.json({ message: 'Proveedor desactivado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el proveedor' });
    }
};
