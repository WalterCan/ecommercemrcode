const logger = require('../utils/logger');
const { Op } = require('sequelize');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Appointment = require('../models/Appointment');
const TherapyType = require('../models/TherapyType');
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
        logger.error('Error fetching general stats:', error);
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
        logger.error('Error fetching sales chart:', error);
        res.status(500).json({ message: 'Error al obtener gráfico de ventas' });
    }
};

/**
 * Obtener Top 5 Productos más vendidos
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
        logger.error('Error fetching top products:', error);
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
        logger.error('Error fetching recent orders:', error);
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
        logger.error('Error fetching category stats:', error);
        res.status(500).json({ message: 'Error al obtener estadísticas de categorías' });
    }
};

/**
 * Obtener estadísticas de ingresos por terapias
 */
/**
 * Obtener estadísticas de ingresos por terapias
 */
exports.getTherapyStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Construir filtro de fecha
        const dateFilter = {};
        if (startDate && endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // Incluir todo el día final
            dateFilter.date = {
                [Op.between]: [new Date(startDate), end]
            };
        }

        // Ingresos Totales de terapias (Confirmadas o Completadas)
        const totalIncome = await Appointment.sum('paid_amount', {
            where: {
                status: { [Op.in]: ['confirmed', 'completed'] },
                ...dateFilter
            }
        });

        // Ingresos Pendientes (Scheduled con monto por pagar)
        // Nota: Para pendientes, quizás queramos ver futuros, pero si filtramos por fecha histórica,
        // mostrar pendientes de esa fecha tiene sentido (turnos que quedaron scheduled en el pasado sin pagar)
        // o futuros si el rango incluye futuro.
        const pendingIncomeRaw = await Appointment.findAll({
            where: {
                status: 'scheduled',
                ...dateFilter
            },
            attributes: [
                [sequelize.literal('SUM(price_amount - paid_amount)'), 'pending']
            ],
            raw: true
        });
        const pendingIncome = pendingIncomeRaw[0]?.pending || 0;

        // Cantidad de sesiones realizadas/por realizar
        const totalSessions = await Appointment.count({
            where: {
                status: { [Op.in]: ['scheduled', 'confirmed', 'completed'] },
                ...dateFilter
            }
        });

        // Desglose por tipo de terapia
        const therapyTypeStats = await Appointment.findAll({
            attributes: [
                'therapy_type_id',
                [sequelize.fn('SUM', sequelize.col('paid_amount')), 'income'],
                [sequelize.fn('COUNT', sequelize.col('Appointment.id')), 'count']
            ],
            include: [{
                model: TherapyType,
                as: 'therapy',
                attributes: ['name']
            }],
            where: {
                status: { [Op.in]: ['confirmed', 'completed'] },
                therapy_type_id: { [Op.ne]: null },
                ...dateFilter
            },
            group: ['therapy_type_id', 'therapy.id', 'therapy.name']
        });

        const formattedTherapyStats = therapyTypeStats.map(stat => ({
            name: stat.therapy ? stat.therapy.name : 'Desconocida',
            income: parseFloat(stat.get('income') || 0),
            count: parseInt(stat.get('count') || 0)
        }));

        res.json({
            totalIncome: parseFloat(totalIncome || 0),
            pendingIncome: parseFloat(pendingIncome || 0),
            totalSessions,
            byType: formattedTherapyStats
        });

    } catch (error) {
        logger.error('Error fetching therapy stats:', error);
        res.status(500).json({ message: error.message || 'Error al obtener estadísticas de terapias' });
    }
};

/**
 * Gráfico de ingresos por terapias (Últimos 30 días o Rango seleccionado)
 */
exports.getTherapySalesChart = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let dateFilter = {};

        if (startDate && endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            dateFilter.date = {
                [Op.between]: [new Date(startDate), end]
            };
        } else {
            // Default: últimos 30 días
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            dateFilter.date = { [Op.gte]: thirtyDaysAgo };
        }

        const incomeData = await Appointment.findAll({
            attributes: [
                [sequelize.fn('DATE', sequelize.col('date')), 'date'],
                [sequelize.fn('SUM', sequelize.col('paid_amount')), 'total'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: {
                ...dateFilter,
                status: { [Op.in]: ['confirmed', 'completed'] }
            },
            group: [sequelize.fn('DATE', sequelize.col('date'))],
            order: [[sequelize.fn('DATE', sequelize.col('date')), 'ASC']],
            raw: true
        });

        res.json(incomeData);
    } catch (error) {
        logger.error('Error fetching therapy income chart:', error);
        res.status(500).json({ message: error.message || 'Error al obtener gráfico de ingresos de terapias' });
    }
};
