const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Supplier = require('./Supplier');
const User = require('./User');

/**
 * Modelo de Compra (Purchase)
 * Cabecera de la orden de compra a proveedores.
 */
const Purchase = sequelize.define('Purchase', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    supplier_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'suppliers',
            key: 'id'
        }
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Usuario (admin) que registró la compra',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    purchase_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    invoice_number: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Número de factura del proveedor'
    },
    total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('draft', 'received', 'cancelled'),
        defaultValue: 'draft',
        comment: 'draft: Borrador, received: Recibida (stock actualizado), cancelled: Cancelada'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'purchases',
    timestamps: true,
    underscored: true
});

// Relaciones
Purchase.belongsTo(Supplier, { foreignKey: 'supplier_id', as: 'supplier' });
Purchase.belongsTo(User, { foreignKey: 'user_id', as: 'admin' });

module.exports = Purchase;
