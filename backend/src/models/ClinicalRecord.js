const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Patient = require('./Patient');

/**
 * Modelo de Historia Clínica (Notas de Evolución)
 */
const ClinicalRecord = sequelize.define('ClinicalRecord', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    patient_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'patients',
            key: 'id'
        }
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Fecha de la nota de evolución'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Detalle de la sesión o evolución'
    },
    attachments: {
        type: DataTypes.JSON, // Array de URLs o paths
        allowNull: true,
        defaultValue: [],
        comment: 'Archivos adjuntos (fotos, pdfs)'
    }
}, {
    tableName: 'clinical_records',
    timestamps: true,
    underscored: true
});

module.exports = ClinicalRecord;
