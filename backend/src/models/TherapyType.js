const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const TherapyType = sequelize.define('TherapyType', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Nombre del tipo de terapia (ej: Consulta Ayurveda)'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Descripción detallada de la terapia'
    },
    duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 60,
        comment: 'Duración en minutos'
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Precio de la sesión'
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID del profesional que ofrece esta terapia',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Si la terapia está activa/disponible'
    },
    icon: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: '🧘',
        comment: 'Emoji o icono representativo de la terapia'
    },
    image_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'URL de la imagen o SVG cargado para la terapia'
    }
}, {
    tableName: 'therapy_types',
    timestamps: true,
    underscored: true
});

// Relaciones
TherapyType.belongsTo(User, { foreignKey: 'user_id', as: 'professional' });
User.hasMany(TherapyType, { foreignKey: 'user_id', as: 'therapies' });

module.exports = TherapyType;
