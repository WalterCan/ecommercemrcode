const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

/**
 * Modelo de Módulo
 * Catálogo de módulos/funcionalidades disponibles en el sistema
 */
const Module = sequelize.define('Module', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Código único del módulo (ej: appointments, patients, ecommerce)'
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Nombre legible del módulo (ej: "Sistema de Turnos")'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Descripción detallada del módulo'
    },
    icon: {
        type: DataTypes.STRING(10),
        allowNull: true,
        comment: 'Emoji o icono representativo'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Si el módulo está disponible para asignar'
    },
    default_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Si se habilita automáticamente para nuevos usuarios'
    }
}, {
    tableName: 'modules',
    timestamps: true,
    underscored: true
});

module.exports = Module;
