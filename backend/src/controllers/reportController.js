const logger = require('../utils/logger');
const ExcelJS = require('exceljs');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');
const Supplier = require('../models/Supplier');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const TherapyType = require('../models/TherapyType');
const Purchase = require('../models/Purchase');
const PurchaseItem = require('../models/PurchaseItem');

exports.getPurchasesReport = async (req, res) => {
    try {
        const purchases = await Purchase.findAll({
            include: [
                { model: Supplier, as: 'supplier' },
                {
                    model: PurchaseItem,
                    as: 'items',
                    include: [{ model: Product, as: 'product' }]
                }
            ],
            order: [['purchase_date', 'DESC']]
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Compras');

        worksheet.columns = [
            { header: 'ID Compra', key: 'id', width: 10 },
            { header: 'Fecha', key: 'date', width: 15 },
            { header: 'Proveedor', key: 'supplier', width: 25 },
            { header: 'Factura', key: 'invoice', width: 15 },
            { header: 'Estado', key: 'status', width: 15 },
            { header: 'Producto', key: 'product', width: 30 },
            { header: 'Cantidad', key: 'quantity', width: 10 },
            { header: 'Costo Unit.', key: 'unit_cost', width: 15 },
            { header: 'Total Item', key: 'total_item', width: 15 },
            { header: 'Total Compra', key: 'total_purchase', width: 15 },
            { header: 'Notas', key: 'notes', width: 30 }
        ];

        purchases.forEach(purchase => {
            if (purchase.items && purchase.items.length > 0) {
                purchase.items.forEach(item => {
                    worksheet.addRow({
                        id: purchase.id,
                        date: purchase.purchase_date ? purchase.purchase_date.toLocaleDateString() : '',
                        supplier: purchase.supplier ? purchase.supplier.name : 'Desconocido',
                        invoice: purchase.invoice_number || '-',
                        status: purchase.status,
                        product: item.product ? item.product.name : 'Unknown Product',
                        quantity: item.quantity,
                        unit_cost: parseFloat(item.unit_cost),
                        total_item: item.quantity * parseFloat(item.unit_cost),
                        total_purchase: parseFloat(purchase.total_amount),
                        notes: purchase.notes || ''
                    });
                });
            } else {
                worksheet.addRow({
                    id: purchase.id,
                    date: purchase.purchase_date ? purchase.purchase_date.toLocaleDateString() : '',
                    supplier: purchase.supplier ? purchase.supplier.name : 'Desconocido',
                    invoice: purchase.invoice_number || '-',
                    status: purchase.status,
                    product: '-',
                    quantity: 0,
                    unit_cost: 0,
                    total_item: 0,
                    total_purchase: parseFloat(purchase.total_amount),
                    notes: purchase.notes || ''
                });
            }
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=reporte_compras.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        logger.error('Error generating purchases report:', error);
        res.status(500).json({ error: 'Error generando reporte de compras' });
    }
};

exports.getSuppliersReport = async (req, res) => {
    try {
        const suppliers = await Supplier.findAll({
            order: [['name', 'ASC']]
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Proveedores');

        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Nombre', key: 'name', width: 30 },
            { header: 'CUIT/RUT', key: 'tax_id', width: 20 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Teléfono', key: 'phone', width: 20 },
            { header: 'Contacto', key: 'contact_name', width: 25 },
            { header: 'Dirección', key: 'address', width: 35 },
            { header: 'Estado', key: 'status', width: 15 }
        ];

        suppliers.forEach(supplier => {
            worksheet.addRow({
                id: supplier.id,
                name: supplier.name,
                tax_id: supplier.tax_id || '-',
                email: supplier.email || '-',
                phone: supplier.phone || '-',
                contact_name: supplier.contact_name || '-',
                address: supplier.address || '-',
                status: supplier.is_active ? 'Activo' : 'Inactivo'
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=reporte_proveedores.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        logger.error('Error generating suppliers report:', error);
        res.status(500).json({ error: 'Error generando reporte de proveedores' });
    }
};

exports.getTurnsReport = async (req, res) => {
    try {
        const appointments = await Appointment.findAll({
            include: [
                {
                    model: Patient,
                    as: 'patient',
                    include: [{ model: User, as: 'user' }]
                },
                { model: TherapyType, as: 'therapy' }
            ],
            order: [['date', 'DESC'], ['time', 'ASC']]
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Turnos');

        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Fecha', key: 'date', width: 15 },
            { header: 'Hora', key: 'time', width: 10 },
            { header: 'Estado', key: 'status', width: 15 },
            { header: 'Paciente', key: 'patient', width: 25 },
            { header: 'Terapia', key: 'therapy', width: 25 },
            { header: 'Precio', key: 'price', width: 15 },
            { header: 'Pagado', key: 'paid', width: 15 },
            { header: 'Notas', key: 'notes', width: 30 }
        ];

        appointments.forEach(app => {
            let patientName = 'Sin Paciente';
            if (app.patient && app.patient.user) {
                patientName = app.patient.user.name || 'Sin Nombre';
            }

            worksheet.addRow({
                id: app.id,
                date: app.date,
                time: app.time,
                status: app.status,
                patient: patientName,
                therapy: app.therapy ? app.therapy.name : '-',
                price: app.price_amount || 0,
                paid: app.paid_amount || 0,
                notes: app.notes || ''
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=reporte_turnos.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        logger.error('Error generating turns report:', error);
        res.status(500).json({ error: 'Error generando reporte de turnos' });
    }
};

exports.getTherapiesReport = async (req, res) => {
    try {
        const appointments = await Appointment.findAll({
            where: {
                therapy_type_id: { [require('sequelize').Op.ne]: null }
            },
            include: [
                {
                    model: Patient,
                    as: 'patient',
                    include: [{ model: User, as: 'user' }]
                },
                { model: TherapyType, as: 'therapy', include: [{ model: User, as: 'professional' }] }
            ],
            order: [['date', 'DESC']]
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Terapias');

        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Fecha', key: 'date', width: 15 },
            { header: 'Terapia', key: 'therapy', width: 25 },
            { header: 'Profesional', key: 'professional', width: 25 },
            { header: 'Paciente', key: 'patient', width: 25 },
            { header: 'Estado', key: 'status', width: 15 },
            { header: 'Monto', key: 'amount', width: 15 }
        ];

        appointments.forEach(app => {
            let patientName = 'N/A';
            if (app.patient && app.patient.user) {
                patientName = app.patient.user.name || 'Sin Nombre';
            }

            worksheet.addRow({
                id: app.id,
                date: app.date,
                therapy: app.therapy ? app.therapy.name : 'Desconocida',
                professional: app.therapy && app.therapy.professional ? app.therapy.professional.name : 'N/A',
                patient: patientName,
                status: app.status,
                amount: app.price_amount || 0
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=reporte_terapias.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        logger.error('Error generating therapies report:', error);
        res.status(500).json({ error: 'Error generando reporte de terapias' });
    }
};

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
        logger.error('Error generating sales report:', error);
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
        logger.error('Error generating stock report:', error);
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
        logger.error('Error generating customers report:', error);
        res.status(500).json({ error: 'Error generando reporte de clientes' });
    }
};
