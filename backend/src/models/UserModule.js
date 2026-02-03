const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const Module = require('./Module');

/**
 * Modelo de UserModule (Relación Many-to-Many)
 * Almacena qué módulos tiene habilitados cada usuario
 */
const UserModule = sequelize.define('UserModule', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    module_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'modules',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Si el módulo está actualmente habilitado para este usuario'
    },
    enabled_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha en que se habilitó el módulo'
    },
    enabled_by_admin_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        },
        comment: 'ID del Super Admin que habilitó el módulo'
    }
}, {
    tableName: 'user_modules',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'module_id'],
            name: 'unique_user_module'
        }
    ]
});

// ============================================
// RELACIONES
// ============================================
// User <-> Module (Many-to-Many a través de UserModule)
User.belongsToMany(Module, {
    through: UserModule,
    as: 'modules',
    foreignKey: 'user_id'
});

Module.belongsToMany(User, {
    through: UserModule,
    as: 'users',
    foreignKey: 'module_id'
});

// Relación directa para acceder a UserModule
User.hasMany(UserModule, { foreignKey: 'user_id', as: 'userModules' });
Module.hasMany(UserModule, { foreignKey: 'module_id', as: 'moduleUsers' });
UserModule.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
UserModule.belongsTo(Module, { foreignKey: 'module_id', as: 'module' });

module.exports = UserModule;
