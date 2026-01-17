const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

/**
 * Modelo de Categoría
 * Representa las agrupaciones de productos (ej: Aceites, Cristales, Inciensos).
 */
const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'categories'
});

module.exports = Category;
