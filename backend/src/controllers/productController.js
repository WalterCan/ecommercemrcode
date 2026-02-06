const Product = require('../models/Product');
const ProductImage = require('../models/ProductImage');
const Category = require('../models/Category');
const ProductVariant = require('../models/ProductVariant');
const fs = require('fs');
const path = require('path');

/**
 * Obtener todos los productos
 */
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            include: [
                { model: Category, as: 'category' },
                { model: ProductImage, as: 'images' },
                { model: ProductVariant, as: 'variants' }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Error al obtener productos' });
    }
};

/**
 * Obtener producto por ID
 */
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: [
                { model: Category, as: 'category' },
                { model: ProductImage, as: 'images' },
                { model: ProductVariant, as: 'variants' }
            ]
        });

        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Error al obtener el producto' });
    }
};

/**
 * Obtener productos destacados
 */
exports.getFeaturedProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            where: { featured: true },
            include: [
                { model: Category, as: 'category' },
                { model: ProductImage, as: 'images' },
                { model: ProductVariant, as: 'variants' }
            ],
            limit: 8
        });
        res.json(products);
    } catch (error) {
        console.error('Error fetching featured products:', error);
        res.status(500).json({ message: 'Error al obtener productos destacados' });
    }
};

/**
 * Crear nuevo producto con soporte para múltiples imágenes
 */
exports.createProduct = async (req, res) => {
    try {
        const productData = req.body;

        // Manejo de imágenes
        const files = req.files || [];

        // Si hay imágenes, usaremos la primera como imagen principal (legacy support)
        if (files.length > 0) {
            productData.image_url = `/uploads/${files[0].filename}`;
        }

        const product = await Product.create(productData);

        // Guardar todas las imágenes en la tabla relacional
        if (files.length > 0) {
            const imagePromises = files.map(file => {
                return ProductImage.create({
                    product_id: product.id,
                    image_url: `/uploads/${file.filename}`
                });
            });
            await Promise.all(imagePromises);
        }

        // Manejo de Variantes
        if (req.body.variants) {
            let variantsData = [];
            try {
                // Puede venir como string JSON (FormData) o objeto directo (JSON body)
                variantsData = typeof req.body.variants === 'string'
                    ? JSON.parse(req.body.variants)
                    : req.body.variants;

                if (Array.isArray(variantsData) && variantsData.length > 0) {
                    const variantPromises = variantsData.map(variant => {
                        return ProductVariant.create({
                            product_id: product.id,
                            name: variant.name,
                            additional_price: variant.additional_price || 0,
                            stock: variant.stock || 0
                        });
                    });
                    await Promise.all(variantPromises);
                }
            } catch (e) {
                console.error('Error parsing variants:', e);
            }
        }

        // Devolver producto con sus imágenes y variantes
        const finalProduct = await Product.findByPk(product.id, {
            include: [
                { model: ProductImage, as: 'images' },
                { model: ProductVariant, as: 'variants' }
            ]
        });

        res.status(201).json(finalProduct);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Error al crear producto', error: error.message });
    }
};

/**
 * Actualizar producto y gestionar galería
 */
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Producto no encontrado' });

        const productData = req.body;
        const files = req.files || [];

        // Si se subieron nuevas imágenes
        if (files.length > 0) {
            // Actualizar la principal si no tenía o si se decide reemplazar
            if (!product.image_url) {
                productData.image_url = `/uploads/${files[0].filename}`;
            }

            // Guardar nuevas en galería
            const imagePromises = files.map(file => {
                return ProductImage.create({
                    product_id: product.id,
                    image_url: `/uploads/${file.filename}`
                });
            });
            await Promise.all(imagePromises);
        }

        // Eliminar imágenes seleccionadas para borrar
        if (req.body.deleted_images) {
            const deletedIds = JSON.parse(req.body.deleted_images); // Array de IDs
            if (deletedIds.length > 0) {
                // Buscar archivos para borrar del disco (opcional, buena práctica)
                const imagesToDelete = await ProductImage.findAll({
                    where: {
                        id: deletedIds,
                        product_id: product.id // seguridad
                    }
                });

                // Eliminar registros
                await ProductImage.destroy({
                    where: {
                        id: deletedIds,
                        product_id: product.id
                    }
                });

                // Intentar borrar del disco
                imagesToDelete.forEach(img => {
                    const filePath = path.join(__dirname, '../../', img.image_url);
                    fs.unlink(filePath, (err) => {
                        if (err) console.error('Error deleting file:', filePath, err);
                    });
                });
            }
        }

        // Manejo de Variantes
        if (req.body.variants) {
            let variantsData = [];
            try {
                // Parseo seguro
                variantsData = typeof req.body.variants === 'string'
                    ? JSON.parse(req.body.variants)
                    : req.body.variants;

                if (Array.isArray(variantsData)) {
                    // 1. Obtener variantes existentes
                    const existingVariants = await ProductVariant.findAll({ where: { product_id: product.id } });
                    const existingIds = existingVariants.map(v => v.id);

                    // 2. Identificar variantes a borrar, actualizar y crear
                    const incomingIds = variantsData
                        .filter(v => v.id) // Los que tienen ID
                        .map(v => parseInt(v.id));

                    const toDelete = existingIds.filter(id => !incomingIds.includes(id));
                    const toUpdate = variantsData.filter(v => v.id && existingIds.includes(parseInt(v.id)));
                    const toCreate = variantsData.filter(v => !v.id);

                    // 3. Ejecutar acciones
                    // DELETE
                    if (toDelete.length > 0) {
                        await ProductVariant.destroy({ where: { id: toDelete } });
                    }

                    // UPDATE
                    const updatePromises = toUpdate.map(v => {
                        return ProductVariant.update({
                            name: v.name,
                            additional_price: v.additional_price || 0,
                            stock: v.stock || 0
                        }, { where: { id: v.id } });
                    });

                    // CREATE
                    const createPromises = toCreate.map(v => {
                        return ProductVariant.create({
                            product_id: product.id,
                            name: v.name,
                            additional_price: v.additional_price || 0,
                            stock: v.stock || 0
                        });
                    });

                    await Promise.all([...updatePromises, ...createPromises]);
                }
            } catch (e) {
                console.error('Error updating variants:', e);
            }
        }

        await product.update(productData);

        // Devolver producto actualizado
        const updatedProduct = await Product.findByPk(product.id, {
            include: [
                { model: ProductImage, as: 'images' },
                { model: ProductVariant, as: 'variants' }
            ]
        });

        res.json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Error al actualizar producto', error: error.message });
    }
};

/**
 * Eliminar producto
 */
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Producto no encontrado' });

        // Eliminar variante, imagenes y archivo fisico si fuera necesario
        // Por simplicidad, destroy con cascade si está configurado en DB, o manual
        // Sequelize suele necesitar onDelete: 'CASCADE' en las relaciones. 
        // Eliminaremos imagen principal simple del disco si es local
        if (product.image_url && product.image_url.startsWith('/uploads/')) {
            const filePath = path.join(__dirname, '../../', product.image_url);
            fs.unlink(filePath, (err) => {
                if (err) console.error('Error deleting file:', filePath, err);
            });
        }

        await product.destroy();
        res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Error al eliminar producto' });
    }
};
