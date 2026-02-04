const Purchase = require('../models/Purchase');
const PurchaseItem = require('../models/PurchaseItem');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const sequelize = require('../config/db');

/**
 * Obtener todas las compras
 */
exports.getPurchases = async (req, res) => {
    try {
        const purchases = await Purchase.findAll({
            include: [
                { model: Supplier, as: 'supplier', attributes: ['name'] }
            ],
            order: [['purchase_date', 'DESC']]
        });
        res.json(purchases);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener compras' });
    }
};

/**
 * Obtener detalle de una compra
 */
exports.getPurchaseById = async (req, res) => {
    try {
        const purchase = await Purchase.findByPk(req.params.id, {
            include: [
                { model: Supplier, as: 'supplier' },
                {
                    model: PurchaseItem,
                    as: 'items',
                    include: [{ model: Product, as: 'product', attributes: ['name', 'image_url'] }]
                }
            ]
        });
        if (!purchase) return res.status(404).json({ error: 'Compra no encontrada' });
        res.json(purchase);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el detalle de la compra' });
    }
};

/**
 * Crear una nueva compra (Borrador)
 */
exports.createPurchase = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { supplier_id, invoice_number, items, notes } = req.body;
        const user_id = req.user.id;

        // 1. Crear la cabecera
        const purchase = await Purchase.create({
            supplier_id,
            user_id,
            invoice_number,
            notes,
            status: 'draft',
            total_amount: 0
        }, { transaction: t });

        let total = 0;

        // 2. Crear los items
        if (items && items.length > 0) {
            const purchaseItems = items.map(item => {
                total += (item.quantity * item.unit_cost);
                return {
                    purchase_id: purchase.id,
                    product_id: item.product_id,
                    quantity: item.quantity,
                    unit_cost: item.unit_cost
                };
            });
            await PurchaseItem.bulkCreate(purchaseItems, { transaction: t });
        }

        // 3. Actualizar total
        await purchase.update({ total_amount: total }, { transaction: t });

        await t.commit();
        res.status(201).json(purchase);
    } catch (error) {
        await t.rollback();
        res.status(400).json({ error: 'Error al crear la compra', details: error.message });
    }
};

/**
 * Recibir Compra (Actualiza Stock y Precios de Costo)
 */
exports.receivePurchase = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const purchase = await Purchase.findByPk(req.params.id, {
            include: [{ model: PurchaseItem, as: 'items' }],
            transaction: t
        });

        if (!purchase) return res.status(404).json({ error: 'Compra no encontrada' });
        if (purchase.status === 'received') return res.status(400).json({ error: 'La compra ya fue recibida' });

        // Actualizar stock y precio de costo para cada producto
        for (const item of purchase.items) {
            const product = await Product.findByPk(item.product_id, { transaction: t });
            if (product) {
                // Incrementar stock
                const newStock = (product.stock || 0) + item.quantity;
                // Actualizar producto
                await product.update({
                    stock: newStock,
                    cost_price: item.unit_cost // Actualizamos al último precio de costo conocido
                }, { transaction: t });
            }
        }

        // Cambiar estado de la compra
        await purchase.update({ status: 'received' }, { transaction: t });

        await t.commit();
        res.json({ message: 'Compra recibida y stock actualizado correctamente' });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ error: 'Error al recibir la compra', details: error.message });
    }
};

/**
 * Cancelar Compra (Solo si está en draft)
 */
exports.cancelPurchase = async (req, res) => {
    try {
        const purchase = await Purchase.findByPk(req.params.id);
        if (!purchase) return res.status(404).json({ error: 'Compra no encontrada' });
        if (purchase.status !== 'draft') return res.status(400).json({ error: 'No se puede cancelar una compra recibida' });

        await purchase.update({ status: 'cancelled' });
        res.json({ message: 'Compra cancelada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al cancelar la compra' });
    }
};
