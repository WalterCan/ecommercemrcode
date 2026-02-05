const Product = require('../models/Product');
const ProductImage = require('../models/ProductImage');
const Category = require('../models/Category');
const fs = require('fs');
const path = require('path');

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

        // Devolver producto con sus imágenes
        const finalProduct = await Product.findByPk(product.id, {
            include: [{ model: ProductImage, as: 'images' }]
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
            // Actualizar la principal si no tenía o si se decide reemplazar (estrategia simple: la primera nueva es la principal si no hay otra lógica)
            // Para mantener consistencia simple: Si la principal está vacía, poner la primera nueva.
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

        await product.update(productData);

        // Devolver producto actualizado
        const updatedProduct = await Product.findByPk(product.id, {
            include: [{ model: ProductImage, as: 'images' }]
        });

        res.json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Error al actualizar producto', error: error.message });
    }
};
