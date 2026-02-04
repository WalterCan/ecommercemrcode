const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Purchase = require('./Purchase');
const Product = require('./Product');

/**
 * Modelo de Detalle de Compra (PurchaseItem)
 * Contiene los productos individuales de una compra.
 */
const PurchaseItem = sequelize.define('PurchaseItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    purchase_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'purchases',
            key: 'id'
        }
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'products',
            key: 'id'
        }
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    unit_cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        },
        comment: 'Precio de costo por unidad en esta compra específica'
    }
}, {
    tableName: 'purchase_items',
    timestamps: false,
    underscored: true
});

// Relaciones
Purchase.hasMany(PurchaseItem, { foreignKey: 'purchase_id', as: 'items' });
PurchaseItem.belongsTo(Purchase, { foreignKey: 'purchase_id' });
PurchaseItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

module.exports = PurchaseItem;
