const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

/**
 * Modelo de Cupón de Descuento (Coupon)
 */
const Coupon = sequelize.define('Coupon', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isUppercase: true
        }
    },
    discount_type: {
        type: DataTypes.ENUM('percentage', 'fixed'),
        allowNull: false,
        defaultValue: 'percentage'
    },
    discount_value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW
    },
    expiry_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    usage_limit: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
    },
    usage_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'coupons',
    timestamps: true,
    underscored: true
});

module.exports = Coupon;
