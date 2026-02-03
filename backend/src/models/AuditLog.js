const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const AuditLog = sequelize.define('AuditLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // Nullable for system actions or failed logins where user is unknown? Better to track by IP if unknown.
        comment: 'User who performed the action'
    },
    action: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Action type: CREATE, UPDATE, DELETE, LOGIN, LOGIN_FAILED, etc.'
    },
    resource: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Resource affected: User, Patient, Product, etc.'
    },
    resource_id: {
        type: DataTypes.STRING, // String to support uuid or int ids
        allowNull: true,
        comment: 'ID of the affected resource'
    },
    details: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Detailed changes or metadata'
    },
    ip_address: {
        type: DataTypes.STRING,
        allowNull: true
    },
    user_agent: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'audit_logs',
    timestamps: true,
    updatedAt: false, // Audit logs are immutable
    underscored: true
});

AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = AuditLog;
