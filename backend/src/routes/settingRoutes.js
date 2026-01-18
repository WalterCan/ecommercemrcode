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
router.put('/', upload.any(), async (req, res) => {
    console.log('📦 BODY:', req.body);
    console.log('📂 FILES:', req.files?.map(f => ({ fieldname: f.fieldname, filename: f.filename })));

    let settingsUpdates = req.body;

    if (settingsUpdates.data) {
        try {
            settingsUpdates = JSON.parse(settingsUpdates.data);
            console.log('🧩 Datos parseados:', settingsUpdates);
        } catch (e) {
            console.error('❌ Error parsing settings data:', e);
        }
    }

    try {
        // Mapear archivos si vienen en req.files
        if (req.files && Array.isArray(req.files)) {
            req.files.forEach(file => {
                if (file.fieldname === 'hero_image') {
                    settingsUpdates.hero_image_url = `/uploads/${file.filename}`;
                } else if (file.fieldname === 'logo_image') {
                    settingsUpdates.site_logo_url = `/uploads/${file.filename}`;
                } else if (file.fieldname === 'about_mission_image') {
                    settingsUpdates.about_mission_image_url = `/uploads/${file.filename}`;
                } else if (file.fieldname === 'v1_image') {
                    settingsUpdates.about_value_1_image_url = `/uploads/${file.filename}`;
                } else if (file.fieldname === 'v2_image') {
                    settingsUpdates.about_value_2_image_url = `/uploads/${file.filename}`;
                } else if (file.fieldname === 'v3_image') {
                    settingsUpdates.about_value_3_image_url = `/uploads/${file.filename}`;
                } else if (file.fieldname === 'products_empty_image') {
                    settingsUpdates.products_empty_image_url = `/uploads/${file.filename}`;
                }
            });
        }

        console.log('💾 Teóricamente guardando estas claves:', Object.keys(settingsUpdates));

        for (const [key, value] of Object.entries(settingsUpdates)) {
            const valueToSave = (value === null || value === undefined) ? '' : String(value);
            console.log(`📝 Upserting: [${key}] = [${valueToSave}]`);
            await Setting.upsert({ key, value: valueToSave });
        }
        res.json({ success: true, message: 'Configuraciones actualizadas con éxito' });
    } catch (error) {
        console.error('❌ Error catastrófico al actualizar configuraciones:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

module.exports = router;

module.exports = router;
