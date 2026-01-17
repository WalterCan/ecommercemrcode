const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../models/User');
const emailService = require('../services/emailService');
const { validateForgotPassword, validateResetPassword } = require('../middleware/validator');
const { passwordResetLimiter } = require('../middleware/rateLimiter');

/**
 * POST /api/password/forgot
 * Solicitar recuperación de contraseña
 */
router.post('/forgot', passwordResetLimiter, validateForgotPassword, async (req, res) => {
    try {
        const { email } = req.body;

        // Buscar usuario
        const user = await User.findOne({ where: { email } });

        // Por seguridad, siempre retornar el mismo mensaje
        // (no revelar si el email existe o no)
        const successMessage = {
            success: true,
            message: 'Si el email existe en nuestro sistema, recibirás instrucciones para recuperar tu contraseña.'
        };

        if (!user) {
            return res.json(successMessage);
        }

        // Generar token de reset
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

        // Guardar token en la base de datos
        user.reset_password_token = resetToken;
        user.reset_password_expires = resetTokenExpiry;
        await user.save();

        // Enviar email
        await emailService.sendPasswordReset(user, resetToken);

        res.json(successMessage);
    } catch (error) {
        console.error('Error in forgot password:', error);
        res.status(500).json({
            success: false,
            error: 'Error al procesar la solicitud'
        });
    }
});

/**
 * POST /api/password/reset/:token
 * Resetear contraseña con token
 */
router.post('/reset/:token', validateResetPassword, async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // Buscar usuario con token válido y no expirado
        const user = await User.findOne({
            where: {
                reset_password_token: token,
                reset_password_expires: {
                    [require('sequelize').Op.gt]: new Date()
                }
            }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                error: 'Token inválido o expirado'
            });
        }

        // Actualizar contraseña (el hook beforeUpdate se encargará de encriptarla)
        user.password = password;
        user.reset_password_token = null;
        user.reset_password_expires = null;
        await user.save();

        res.json({
            success: true,
            message: 'Contraseña actualizada exitosamente'
        });
    } catch (error) {
        console.error('Error in reset password:', error);
        res.status(500).json({
            success: false,
            error: 'Error al resetear la contraseña'
        });
    }
});

/**
 * GET /api/password/verify/:token
 * Verificar si un token es válido
 */
router.get('/verify/:token', async (req, res) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({
            where: {
                reset_password_token: token,
                reset_password_expires: {
                    [require('sequelize').Op.gt]: new Date()
                }
            }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                error: 'Token inválido o expirado'
            });
        }

        res.json({
            success: true,
            message: 'Token válido'
        });
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(500).json({
            success: false,
            error: 'Error al verificar el token'
        });
    }
});

module.exports = router;
