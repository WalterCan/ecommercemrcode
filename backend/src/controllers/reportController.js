const ExcelJS = require('exceljs');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');

exports.getSalesReport = async (req, res) => {
    try {
        const orders = await Order.findAll({
            order: [['created_at', 'DESC']]
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Ventas');

        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Fecha', key: 'date', width: 20 },
            { header: 'Cliente', key: 'customer', width: 25 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Total', key: 'total', width: 15 },
            { header: 'Estado Pago', key: 'payment_status', width: 15 },
            { header: 'Estado Orden', key: 'order_status', width: 15 },
            { header: 'Método Pago', key: 'payment_method', width: 15 }
        ];

        orders.forEach(order => {
            worksheet.addRow({
                id: order.id,
                date: order.createdAt ? order.createdAt.toLocaleString() : '',
                customer: order.customer_name,
                email: order.customer_email,
                total: parseFloat(order.total),
                payment_status: order.payment_status,
                order_status: order.order_status,
                payment_method: order.payment_method
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=reporte_ventas.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error generating sales report:', error);
        res.status(500).json({ error: 'Error generando reporte de ventas' });
    }
};

exports.getStockReport = async (req, res) => {
    try {
        const products = await Product.findAll({
            include: [{ model: Category, as: 'category' }],
            order: [['stock', 'ASC']]
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Stock');

        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Producto', key: 'name', width: 40 },
            { header: 'Categoría', key: 'category', width: 25 },
            { header: 'Precio', key: 'price', width: 15 },
            { header: 'Stock Actual', key: 'stock', width: 15 },
            { header: 'Stock Mínimo', key: 'min_stock', width: 15 },
            { header: 'Estado', key: 'status', width: 15 }
        ];

        products.forEach(product => {
            let status = 'OK';
            if (product.stock <= product.stock_critico) status = 'CRÍTICO';
            else if (product.stock <= product.stock_minimo) status = 'BAJO';

            worksheet.addRow({
                id: product.id,
                name: product.name,
                category: product.category ? product.category.name : 'Sin Categoría',
                price: parseFloat(product.price),
                stock: product.stock,
                min_stock: product.stock_minimo,
                status: status
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=reporte_stock.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error generating stock report:', error);
        res.status(500).json({ error: 'Error generando reporte de stock' });
    }
};

exports.getCustomersReport = async (req, res) => {
    try {
        const users = await User.findAll({
            order: [['createdAt', 'DESC']]
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Clientes');

        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Nombre', key: 'name', width: 30 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Teléfono', key: 'phone', width: 20 },
            { header: 'Rol', key: 'role', width: 15 },
            { header: 'Fecha Registro', key: 'joined', width: 20 }
        ];

        users.forEach(user => {
            worksheet.addRow({
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone || 'N/A',
                role: user.role,
                joined: user.createdAt ? user.createdAt.toLocaleDateString() : ''
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=reporte_clientes.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error generating customers report:', error);
        res.status(500).json({ error: 'Error generando reporte de clientes' });
    }
};
