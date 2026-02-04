const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

/**
 * Modelo de Proveedor (Supplier)
 * Contiene la información de los proveedores para el módulo de compras.
 */
const Supplier = sequelize.define('Supplier', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    tax_id: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Identificación fiscal (CUIT, RUT, etc.)'
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isEmail: true
        }
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    contact_name: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Nombre de la persona de contacto'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'suppliers',
    timestamps: true,
    underscored: true
});

module.exports = Supplier;
