const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');

/**
 * @route   POST /api/upload
 * @desc    Subir una imagen
 * @access  Public (o Private si se requiere)
 */
router.post('/', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No se ha subido ninguna imagen' });
        }

        // Construir la URL completa de la imagen
        // En producción, esto debería ser la URL del dominio o CDN
        // En desarrollo local, usamos localhost
        const imageUrl = `/uploads/${req.file.filename}`;

        res.status(200).json({
            message: 'Imagen subida con éxito',
            imageUrl: imageUrl
        });
    } catch (error) {
        console.error('Error al subir imagen:', error);
        res.status(500).json({ message: 'Error al subir la imagen' });
    }
});

module.exports = router;
