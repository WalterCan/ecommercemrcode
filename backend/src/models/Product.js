const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Category = require('./Category');

/**
 * Modelo de Producto
 * Contiene la información de los productos de la tienda.
 */
const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    custom_code: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Código EAN, SKU o código interno alfanumérico'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    cost_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
        validate: {
            min: 0
        },
        comment: 'Precio de costo/compra del producto'
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'https://via.placeholder.com/400x400?text=Producto+Holistico'
    },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 10,
        validate: {
            min: 0
        }
    },
    stock_minimo: {
        type: DataTypes.INTEGER,
        defaultValue: 10,
        allowNull: false,
        validate: {
            min: 0
        }
    },
    stock_critico: {
        type: DataTypes.INTEGER,
        defaultValue: 3,
        allowNull: false,
        validate: {
            min: 0
        }
    },
    featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    // Nuevos campos para Servicios (Consultorio)
    type: {
        type: DataTypes.ENUM('physical', 'service'),
        defaultValue: 'physical',
        allowNull: false
    },
    duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Duración en minutos (solo para servicios)'
    }
}, {
    tableName: 'products',
    getterMethods: {
        stockStatus() {
            if (this.stock <= this.stock_critico) {
                return 'critical';
            } else if (this.stock <= this.stock_minimo) {
                return 'low';
            }
            return 'ok';
        }
    }
});

// Relación: Un Producto pertenece a una Categoría
Product.belongsTo(Category, {
    foreignKey: 'category_id',
    as: 'category'
});

// Relación: Una Categoría tiene muchos Productos
Category.hasMany(Product, {
    foreignKey: 'category_id',
    as: 'products'
});

// Definir asociaciones (se pueden mover a index.js o relationships.js si crece)
const ProductImage = require('./ProductImage');
const ProductVariant = require('./ProductVariant');

Product.hasMany(ProductImage, { as: 'images', foreignKey: 'product_id', onDelete: 'CASCADE' });
ProductImage.belongsTo(Product, { foreignKey: 'product_id' });

Product.hasMany(ProductVariant, { as: 'variants', foreignKey: 'product_id', onDelete: 'CASCADE' });
ProductVariant.belongsTo(Product, { foreignKey: 'product_id' });

module.exports = Product;
