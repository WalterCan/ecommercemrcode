const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

/**
 * Modelo de Paciente (Consultorio)
 * Extensión del usuario con datos clínicos/personales.
 */
const Patient = sequelize.define('Patient', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    birth_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    dni: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    emergency_contact: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Nombre y teléfono de contacto de emergencia'
    },
    observations: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Observaciones generales (alergias, notas)'
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true, // 1 Usuario = 1 Paciente
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'patients',
    timestamps: true,
    underscored: true
});

const ClinicalRecord = require('./ClinicalRecord');

// Relación: Un Paciente pertenece a un Usuario
Patient.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});

User.hasOne(Patient, {
    foreignKey: 'user_id',
    as: 'patient'
});

// Relación: Historia Clínica
Patient.hasMany(ClinicalRecord, {
    foreignKey: 'patient_id',
    as: 'clinical_records'
});

ClinicalRecord.belongsTo(Patient, {
    foreignKey: 'patient_id',
    as: 'patient'
});

module.exports = Patient;
