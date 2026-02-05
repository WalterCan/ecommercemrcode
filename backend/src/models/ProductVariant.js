const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

/**
 * Modelo de Variante de Producto
 * Representa opciones como Talle, Peso, Color, etc.
 */
const ProductVariant = sequelize.define('ProductVariant', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'products',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    additional_price: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        comment: 'Monto a sumar (o restar si es negativo) al precio base del producto'
    },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: 0
        }
    }
}, {
    tableName: 'product_variants',
    timestamps: false // No necesitamos created_at/updated_at para esto por ahora
});

module.exports = ProductVariant;
