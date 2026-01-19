const { Op } = require('sequelize');
const Order = require('../models/Order');
const Product = require('../models/Product');
const sequelize = require('../config/db');

/**
 * Obtener estadísticas generales (Cards Superiores)
 */
exports.getGeneralStats = async (req, res) => {
    try {
        // Total Ventas (Solo pagadas)
        const totalSales = await Order.sum('total', {
            where: {
                payment_status: 'approved'
            }
        });

        // Cantidad de Pedidos (Todos los no cancelados)
        const totalOrders = await Order.count({
            where: {
                order_status: { [Op.ne]: 'cancelled' }
            }
        });

        // Ticket Promedio
        const avgTicket = totalOrders > 0 ? (totalSales / totalOrders) : 0;

        // Productos con bajo stock
        const lowStockProducts = await Product.count({
            where: {
                stock: { [Op.lte]: sequelize.col('stock_minimo') }
            }
        });

        res.json({
            totalSales: totalSales || 0,
            totalOrders: totalOrders || 0,
            avgTicket: parseFloat(avgTicket.toFixed(2)),
            lowStockProducts: lowStockProducts || 0
        });

    } catch (error) {
        console.error('Error fetching general stats:', error);
        res.status(500).json({ message: 'Error al obtener estadísticas generales' });
    }
};

/**
 * Obtener datos para el gráfico de ventas (Últimos 30 días)
 */
exports.getSalesChart = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const orders = await Order.findAll({
            attributes: [
                [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
                [sequelize.fn('SUM', sequelize.col('total')), 'total'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: {
                created_at: { [Op.gte]: thirtyDaysAgo },
                payment_status: 'approved'
            },
            group: [sequelize.fn('DATE', sequelize.col('created_at'))],
            order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
            raw: true
        });

        res.json(orders);
    } catch (error) {
        console.error('Error fetching sales chart:', error);
        res.status(500).json({ message: 'Error al obtener gráfico de ventas' });
    }
};

/**
 * Obtener Top 5 Productos más vendidos
 * Nota: Como items es JSON, procesamos esto en memoria por simplicidad
 * Idealmente debería normalizarse la BD para escalar, pero sirve para V1.
 */
exports.getTopProducts = async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: {
                payment_status: 'approved'
            },
            attributes: ['items']
        });

        const productSales = {};

        orders.forEach(order => {
            const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
            if (Array.isArray(items)) {
                items.forEach(item => {
                    if (!productSales[item.id]) {
                        productSales[item.id] = {
                            id: item.id,
                            name: item.name,
                            sales: 0,
                            revenue: 0
                        };
                    }
                    productSales[item.id].sales += item.quantity;
                    productSales[item.id].revenue += item.price * item.quantity;
                });
            }
        });

        const sortedProducts = Object.values(productSales)
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5);

        res.json(sortedProducts);

    } catch (error) {
        console.error('Error fetching top products:', error);
        res.status(500).json({ message: 'Error al obtener productos top' });
    }
};

/**
 * Obtener pedidos recientes (Dashboard)
 */
exports.getRecentOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            limit: 5,
            order: [['created_at', 'DESC']]
        });
        res.json(orders);
    } catch (error) {
        console.error('Error fetching recent orders:', error);
        res.status(500).json({ message: 'Error al obtener pedidos recientes' });
    }
};

/**
 * Obtener estadísticas de categorías (Dashboard)
 */
exports.getCategoryStats = async (req, res) => {
    try {
        const categories = await Product.findAll({
            attributes: [
                'category_id',
                [sequelize.fn('COUNT', sequelize.col('Product.id')), 'count']
            ],
            include: [{
                model: require('../models/Category'),
                as: 'category',
                attributes: ['name']
            }],
            group: ['category_id', 'category.id', 'category.name']
        });

        const formatted = categories.map(c => ({
            name: c.category ? c.category.name : 'Sin Categoría',
            value: parseInt(c.get('count'))
        }));

        res.json(formatted);

    } catch (error) {
        console.error('Error fetching category stats:', error);
        res.status(500).json({ message: 'Error al obtener estadísticas de categorías' });
    }
};
