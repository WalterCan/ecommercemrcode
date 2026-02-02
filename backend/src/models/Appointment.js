const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Patient = require('./Patient');
const TherapyType = require('./TherapyType');

/**
 * Modelo de Turno (Appointment)
 * Representa un bloque de disponibilidad o una reserva confirmada.
 */
const Appointment = sequelize.define('Appointment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    time: {
        type: DataTypes.TIME,
        allowNull: false,
        comment: 'Hora de inicio'
    },
    end_time: {
        type: DataTypes.TIME,
        allowNull: false,
        comment: 'Hora de fin del bloque'
    },
    status: {
        type: DataTypes.ENUM('available', 'scheduled', 'confirmed', 'completed', 'cancelled', 'no_show', 'blocked'),
        defaultValue: 'available',
        comment: 'available = disponible para reservar, scheduled = reservado por cliente'
    },
    // Campos Financieros
    price_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Precio total del turno al momento de reservar'
    },
    paid_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        comment: 'Monto total abonado hasta el momento'
    },
    payment_method: {
        type: DataTypes.ENUM('mercadopago', 'transfer', 'cash', 'other'),
        defaultValue: 'other',
        comment: 'Método de pago de la seña/total'
    },
    payment_status: {
        type: DataTypes.ENUM('pending', 'partial', 'paid', 'refunded'),
        defaultValue: 'pending'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    patient_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // Null cuando es disponibilidad sin reservar
        references: {
            model: 'patients',
            key: 'id'
        }
    },
    therapy_type_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID del tipo de terapia (NULL si solo es disponibilidad)',
        references: {
            model: 'therapy_types',
            key: 'id'
        }
    },
    // Campos para recordatorios automáticos
    reminder_24h_sent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Recordatorio de 24h enviado'
    },
    reminder_1h_sent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Recordatorio de 1h enviado'
    },
    reminder_24h_sent_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha y hora de envío del recordatorio de 24h'
    },
    reminder_1h_sent_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha y hora de envío del recordatorio de 1h'
    }
}, {
    tableName: 'appointments',
    timestamps: true,
    underscored: true
});

// Relaciones
Appointment.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });
Patient.hasMany(Appointment, { foreignKey: 'patient_id', as: 'appointments' });

Appointment.belongsTo(TherapyType, { foreignKey: 'therapy_type_id', as: 'therapy' });
TherapyType.hasMany(Appointment, { foreignKey: 'therapy_type_id', as: 'appointments' });

module.exports = Appointment;
