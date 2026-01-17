const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

/**
 * Modelo de Configuración (Setting)
 * Almacena pares clave-valor para la configuración global de la tienda.
 */
const Setting = sequelize.define('Setting', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true
        }
    },
    value: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'settings',
    timestamps: true
});

module.exports = Setting;
