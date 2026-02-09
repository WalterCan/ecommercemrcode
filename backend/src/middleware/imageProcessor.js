const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const logger = require('../utils/logger');

/**
 * Middleware para procesar imágenes con Sharp
 * Genera versiones optimizadas en WebP (thumbnail, medium, large)
 */
const processImages = async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
        return next();
    }

    try {
        const processedFiles = [];

        for (const file of req.files) {
            // Solo procesar imágenes
            if (!file.mimetype.startsWith('image/')) {
                processedFiles.push(file);
                continue;
            }

            const filename = path.parse(file.filename).name;
            const uploadDir = path.dirname(file.path);

            // Definir tamaños
            const sizes = {
                thumbnail: { width: 150, height: 150, suffix: '_thumb' },
                medium: { width: 500, height: 500, suffix: '_medium' },
                large: { width: 1200, height: 1200, suffix: '_large' }
            };

            // Generar versiones WebP
            for (const [sizeName, config] of Object.entries(sizes)) {
                const outputPath = path.join(
                    uploadDir,
                    `${filename}${config.suffix}.webp`
                );

                await sharp(file.path)
                    .resize(config.width, config.height, {
                        fit: 'inside',
                        withoutEnlargement: true
                    })
                    .webp({ quality: 85 })
                    .toFile(outputPath);

                logger.info(`Generated ${sizeName} WebP: ${outputPath}`);
            }

            // También generar versión WebP del original
            const originalWebP = path.join(uploadDir, `${filename}.webp`);
            await sharp(file.path)
                .webp({ quality: 90 })
                .toFile(originalWebP);

            // Actualizar file object con la ruta WebP
            file.webpPath = `/uploads/${filename}.webp`;
            file.thumbnailPath = `/uploads/${filename}_thumb.webp`;
            file.mediumPath = `/uploads/${filename}_medium.webp`;
            file.largePath = `/uploads/${filename}_large.webp`;

            processedFiles.push(file);
        }

        req.files = processedFiles;
        next();
    } catch (error) {
        logger.error('Error processing images with Sharp:', error);
        // Continuar sin procesar si hay error
        next();
    }
};

/**
 * Función helper para eliminar todas las versiones de una imagen
 */
const deleteImageVersions = async (imagePath) => {
    try {
        const parsed = path.parse(imagePath);
        const baseDir = parsed.dir;
        const baseName = parsed.name;

        // Lista de sufijos a eliminar
        const suffixes = ['', '_thumb', '_medium', '_large'];
        const extensions = [parsed.ext, '.webp'];

        for (const suffix of suffixes) {
            for (const ext of extensions) {
                const filePath = path.join(baseDir, `${baseName}${suffix}${ext}`);
                try {
                    await fs.unlink(filePath);
                    logger.info(`Deleted image version: ${filePath}`);
                } catch (err) {
                    // Ignorar si el archivo no existe
                    if (err.code !== 'ENOENT') {
                        logger.warn(`Could not delete ${filePath}:`, err.message);
                    }
                }
            }
        }
    } catch (error) {
        logger.error('Error deleting image versions:', error);
    }
};

module.exports = {
    processImages,
    deleteImageVersions
};
