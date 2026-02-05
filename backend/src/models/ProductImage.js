const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ProductImage = sequelize.define('ProductImage', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'products', // Nombre de la tabla (lowercase on Linux)
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'product_images',
    timestamps: false
});

module.exports = ProductImage;
