const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');
const upload = require('../middleware/uploadMiddleware');

/**
 * GET /api/settings
 * Obtiene todas las configuraciones de la tienda.
 */
router.get('/', async (req, res) => {
    try {
        const settings = await Setting.findAll();
        // Convertimos el array en un objeto clave:valor para facilitar su uso en el frontend
        const settingsObject = settings.reduce((acc, setting) => {
            acc[setting.key] = setting.value;
            return acc;
        }, {});
        res.json(settingsObject);
    } catch (error) {
        console.error('Error al obtener configuraciones:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

/**
 * PUT /api/settings
 * Actualiza múltiples configuraciones a la vez. Soporta subida de imagen para el hero.
 */
router.put('/', upload.fields([{ name: 'hero_image', maxCount: 1 }, { name: 'logo_image', maxCount: 1 }]), async (req, res) => {
    let settingsUpdates = req.body; // Un objeto { key: value, ... }

    // Si viene un objeto stringificado (cuando se usa FormData)
    if (settingsUpdates.data) {
        try {
            settingsUpdates = JSON.parse(settingsUpdates.data);
        } catch (e) {
            console.error('Error parsing settings data:', e);
        }
    }

    try {
        // Si se subió una imagen para el hero
        if (req.files && req.files['hero_image']) {
            settingsUpdates.hero_image_url = `/uploads/${req.files['hero_image'][0].filename}`;
        }

        // Si se subió un logo
        if (req.files && req.files['logo_image']) {
            settingsUpdates.site_logo_url = `/uploads/${req.files['logo_image'][0].filename}`;
        }

        for (const [key, value] of Object.entries(settingsUpdates)) {
            // Manejar nulos y undefined para no guardar "null" como texto
            const valueToSave = (value === null || value === undefined) ? '' : String(value);
            await Setting.upsert({ key, value: valueToSave });
        }
        res.json({ success: true, message: 'Configuraciones actualizadas' });
    } catch (error) {
        console.error('Error al actualizar configuraciones:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

module.exports = router;

module.exports = router;
