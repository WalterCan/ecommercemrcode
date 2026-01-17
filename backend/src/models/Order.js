const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

/**
 * Modelo de Pedido (Order)
 * Almacena información del pedido, cliente y estado de pago
 */
const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    // Datos del cliente
    customer_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    customer_email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    customer_phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    customer_address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    customer_city: {
        type: DataTypes.STRING,
        allowNull: true
    },
    customer_postal_code: {
        type: DataTypes.STRING,
        allowNull: true
    },

    // Información del pedido
    items: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: 'Array de productos: [{id, name, price, quantity, image_url}]'
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },

    // Estado del pedido
    order_status: {
        type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
        defaultValue: 'pending'
    },

    // Información de pago
    payment_method: {
        type: DataTypes.ENUM('mercadopago', 'transfer', 'whatsapp', 'cash'),
        allowNull: false
    },
    payment_status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'refunded'),
        defaultValue: 'pending'
    },

    // IDs de Mercado Pago (si aplica)
    preference_id: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'ID de preferencia de Mercado Pago'
    },
    payment_id: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'ID de pago de Mercado Pago'
    },
    init_point: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'URL de pago de Mercado Pago'
    },

    // Datos de Envío
    shipping_method: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'pickup',
        comment: 'Método de envío: pickup (sucursal), delivery (envío)'
    },
    shipping_cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'Costo de envío'
    },

    // Notas adicionales
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    // Descuentos y Cupones
    coupon_code: {
        type: DataTypes.STRING,
        allowNull: true
    },
    discount_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'orders',
    timestamps: true,
    underscored: true
});

module.exports = Order;
