const Product = require('../models/Product');

/**
 * Middleware para validar disponibilidad de stock antes de crear un pedido
 */
const validateStock = async (req, res, next) => {
    try {
        const { items } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No se proporcionaron productos en el pedido'
            });
        }

        // Validar stock para cada producto
        const stockErrors = [];

        for (const item of items) {
            const product = await Product.findByPk(item.id);

            if (!product) {
                stockErrors.push({
                    productId: item.id,
                    productName: item.name || 'Producto desconocido',
                    error: 'Producto no encontrado'
                });
                continue;
            }

            if (product.stock < item.quantity) {
                stockErrors.push({
                    productId: product.id,
                    productName: product.name,
                    requested: item.quantity,
                    available: product.stock,
                    error: `Stock insuficiente. Solo quedan ${product.stock} unidades disponibles`
                });
            }
        }

        // Si hay errores de stock, retornar error
        if (stockErrors.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Algunos productos no tienen stock suficiente',
                stockErrors
            });
        }

        // Todo OK, continuar
        next();
    } catch (error) {
        console.error('Error validating stock:', error);
        res.status(500).json({
            success: false,
            error: 'Error al validar disponibilidad de stock'
        });
    }
};

/**
 * Función helper para decrementar stock después de confirmar pago
 */
const decrementStock = async (items) => {
    try {
        for (const item of items) {
            const product = await Product.findByPk(item.id);
            if (product) {
                await product.decrement('stock', { by: item.quantity });
            }
        }
        return { success: true };
    } catch (error) {
        console.error('Error decrementing stock:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Función helper para restaurar stock al cancelar pedido
 */
const restoreStock = async (items) => {
    try {
        for (const item of items) {
            const product = await Product.findByPk(item.id);
            if (product) {
                await product.increment('stock', { by: item.quantity });
            }
        }
        return { success: true };
    } catch (error) {
        console.error('Error restoring stock:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    validateStock,
    decrementStock,
    restoreStock
};
