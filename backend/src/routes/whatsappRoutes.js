// D:\PROYECTOS\tiendavirtual\backend\src\routes\whatsappRoutes.js
const express = require('express');
const router = express.Router();

// Importar el servicio NUEVO
const whatsappService = require('../services/whatsappService');

// GET /api/whatsapp/status
router.get('/status', async (req, res) => {
    try {
        const status = await whatsappService.getWhatsAppStatus();
        res.json({
            success: true,
            ...status,
            serverTime: new Date()
        });
    } catch (error) {
        console.error('Error status:', error);
        res.status(500).json({
            success: false,
            error: 'Error obteniendo estado',
            status: 'error'
        });
    }
});

// GET /api/whatsapp/qr
router.get('/qr', (req, res) => {
    try {
        const qrData = whatsappService.getQRCode();
        res.json({
            success: true,
            ...qrData,
            serverTime: new Date()
        });
    } catch (error) {
        console.error('Error QR:', error);
        res.status(500).json({
            success: false,
            error: 'Error obteniendo QR'
        });
    }
});

// POST /api/whatsapp/regenerate
router.post('/regenerate', async (req, res) => {
    try {
        const result = await whatsappService.regenerateQR();
        res.json({
            ...result,
            serverTime: new Date()
        });
    } catch (error) {
        console.error('Error regenerando:', error);
        res.status(500).json({
            success: false,
            error: 'Error regenerando QR'
        });
    }
});

// POST /api/whatsapp/disconnect
router.post('/disconnect', async (req, res) => {
    try {
        const result = await whatsappService.disconnectWhatsApp();
        res.json({
            ...result,
            serverTime: new Date()
        });
    } catch (error) {
        console.error('Error desconectando:', error);
        res.status(500).json({
            success: false,
            error: 'Error desconectando'
        });
    }
});

// POST /api/whatsapp/test
router.post('/test', async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                error: 'Número requerido'
            });
        }

        const result = await whatsappService.sendTestMessage(phoneNumber);
        res.json({
            ...result,
            serverTime: new Date()
        });
    } catch (error) {
        console.error('Error test:', error);
        res.status(500).json({
            success: false,
            error: 'Error enviando prueba'
        });
    }
});

module.exports = router;