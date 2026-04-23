const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');
const ProductVariant = require('../models/ProductVariant');
const Coupon = require('../models/Coupon');
const sequelize = require('../config/db');
const { createPaymentPreference, getPaymentInfo } = require('../services/mercadopagoService');
const { sendOrderMessage } = require('../services/whatsappService');
const emailService = require('../services/emailService');
const { validateOrder } = require('../middleware/validator');
const { orderLimiter } = require('../middleware/rateLimiter');
const { protect, admin } = require('../middleware/authMiddleware');
const { Op } = require('sequelize');

/**
 * GET /api/orders
 * Obtener todos los pedidos (para admin) con filtros opcionales de fecha
 */
router.get('/', protect, admin, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const whereClause = {};

        // Filtro por fecha
        if (startDate || endDate) {
            whereClause.created_at = {};
            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                whereClause.created_at[Op.gte] = start;
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                whereClause.created_at[Op.lte] = end;
            }
        }

        const orders = await Order.findAll({
            where: whereClause,
            order: [['created_at', 'DESC']]
        });
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Error al obtener pedidos' });
    }
});

/**
 * GET /api/orders/:id
 * Obtener un pedido específico por ID (Público para confirmación)
 */
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);
        if (!order) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }
        res.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ error: 'Error al obtener pedido' });
    }
});

/**
 * POST /api/orders
 * Crear nuevo pedido (desde el frontend del cliente)
 */
router.post('/', orderLimiter, validateOrder, async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const {
            customer_name,
            customer_email,
            customer_phone,
            customer_address,
            customer_city,
            customer_postal_code,
            items,
            total,
            payment_method,
            shipping_method,
            shipping_cost,
            notes,
            coupon_code,
            discount_amount,
            user_id
        } = req.body;

        console.log('--- NEW ORDER REQUEST ---');
        console.log('Customer:', customer_name, customer_email);
        console.log('Method:', payment_method);
        console.log('Items Count:', items ? items.length : 0);
        console.log('Total:', total);

        // ============================================
        // VALIDACIONES DE DATOS
        // ============================================
        if (!customer_name || !customer_email || !customer_phone) {
            await t.rollback();
            return res.status(400).json({ error: 'Faltan datos del cliente' });
        }

        if (!items || items.length === 0) {
            await t.rollback();
            return res.status(400).json({ error: 'El pedido debe tener al menos un producto' });
        }

        if (!total || total <= 0) {
            await t.rollback();
            return res.status(400).json({ error: 'Total inválido' });
        }

        if (!payment_method) {
            await t.rollback();
            return res.status(400).json({ error: 'Método de pago requerido' });
        }

        // ============================================
        // VALIDACIÓN Y ACTUALIZACIÓN DE STOCK + RECÁLCULO DE TOTAL
        // ============================================
        let serverSubtotal = 0;
        for (const item of items) {
            const product = await Product.findByPk(item.id, { transaction: t });

            if (!product) {
                await t.rollback();
                return res.status(404).json({ error: `El producto ${item.name} ya no existe en nuestro catálogo` });
            }

            // [NEW] Lógica de Variantes
            if (item.variant) {
                const variant = await ProductVariant.findByPk(item.variant.id, { transaction: t });
                if (!variant) {
                    await t.rollback();
                    return res.status(404).json({ error: `La variante ${item.variant.name} de ${item.name} ya no existe` });
                }

                if (variant.stock < item.quantity) {
                    await t.rollback();
                    return res.status(400).json({
                        error: `Stock insuficiente para ${item.name} (${variant.name})`,
                        available: variant.stock,
                        requested: item.quantity
                    });
                }

                // Decrementar stock de variante
                await variant.update({
                    stock: variant.stock - item.quantity
                }, { transaction: t });

            } else {
                // Lógica Estándar (Producto sin variante)
                if (product.stock < item.quantity) {
                    await t.rollback();
                    return res.status(400).json({
                        error: `Stock insuficiente para ${item.name}`,
                        available: product.stock,
                        requested: item.quantity
                    });
                }

                // Decrementar stock de producto base
                await product.update({
                    stock: product.stock - item.quantity
                }, { transaction: t });
            }

            serverSubtotal += parseFloat(product.price) * item.quantity;
        }

        // Validar que el total enviado no sea menor al subtotal real (tolerancia de $1 por redondeos)
        const serverTotal = serverSubtotal - parseFloat(discount_amount || 0) + parseFloat(shipping_cost || 0);
        if (parseFloat(total) < serverTotal - 1) {
            await t.rollback();
            return res.status(400).json({ error: 'El total del pedido no coincide con los precios actuales' });
        }

        // ============================================
        // CREACIÓN DEL PEDIDO EN LA BASE DE DATOS
        // ============================================
        const order = await Order.create({
            customer_name,
            customer_email,
            customer_phone,
            customer_address,
            customer_city,
            customer_postal_code,
            items,
            total,
            payment_method,
            shipping_method: shipping_method || 'pickup',
            shipping_cost: shipping_cost || 0,
            notes,
            coupon_code,
            discount_amount: discount_amount || 0,
            order_status: 'pending',
            payment_status: 'pending',
            user_id: user_id || null
        }, { transaction: t });

        // Incrementar uso de cupón si aplica
        if (coupon_code) {
            const coupon = await Coupon.findOne({ where: { code: coupon_code }, transaction: t });
            if (coupon) {
                await coupon.update({
                    usage_count: coupon.usage_count + 1
                }, { transaction: t });
            }
        }

        // Commit de la transacción
        await t.commit();
        console.log(`✅ Pedido creado y stock actualizado. ID: ${order.id}`);

        // ============================================
        // PROCESAMIENTO DE MERCADO PAGO (SI APLICA)
        // ============================================
        if (payment_method === 'mercadopago') {
            try {
                const preference = await createPaymentPreference({
                    id: order.id,
                    items,
                    total,
                    customer_name,
                    customer_email,
                    customer_phone
                });

                // Actualizar order con datos de MP
                order.preference_id = preference.preference_id;
                order.init_point = preference.init_point;
                await order.save(); // Not in transaction, but that's okay

                console.log('✅ Preferencia de Mercado Pago creada:', preference.preference_id);
            } catch (mpError) {
                console.error('CRÍTICO: Error creando preferencia de Mercado Pago:', mpError);
            }
        }

        // ============================================
        // ENVÍO DE NOTIFICACIÓN WHATSAPP (ASINCRÓNICO)
        // ============================================
        setTimeout(async () => {
            try {
                await sendOrderMessage(order, 'new');
            } catch (error) {
                console.error(`❌ Error en envío asincrónico de WhatsApp para pedido #${order.id}:`, error);
            }
        }, 1000);

        // ============================================
        // ENVÍO DE EMAIL DE CONFIRMACIÓN
        // ============================================
        setTimeout(async () => {
            try {
                const result = await emailService.sendOrderConfirmation(order);
                if (result.success) {
                    console.log(`✅ Email de confirmación enviado para pedido #${order.id}`);
                } else {
                    console.error(`❌ Falló el envío de email de confirmación para pedido #${order.id}:`, result.error);
                }
            } catch (error) {
                console.error(`❌ Error enviando email de confirmación:`, error);
            }
        }, 1500);

        // ============================================
        // RESPUESTA EXITOSA AL CLIENTE
        // ============================================
        res.status(201).json({
            success: true,
            order: order,
            message: 'Pedido creado exitosamente'
        });
    } catch (error) {
        console.error('❌ Error creando pedido:', error);
        if (t) await t.rollback();
        res.status(500).json({
            success: false,
            error: 'Error al crear pedido',
            details: error.message
        });
    }
});

/**
 * PUT /api/orders/:id
 * Actualizar estado de pedido (para administración)
 */
router.put('/:id', protect, admin, async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const order = await Order.findByPk(req.params.id, { transaction: t });
        if (!order) {
            await t.rollback();
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        const { order_status, payment_status, notes } = req.body;
        const previousStatus = order.order_status;
        const newStatus = order_status || previousStatus;

        // ============================================
        // GESTIÓN INTELIGENTE DE STOCK
        // ============================================

        // Caso A: De cualquier estado a CANCELADO (Devolver Stock)
        if (previousStatus !== 'cancelled' && newStatus === 'cancelled') {
            console.log(`📦 Devolviendo stock por cancelación del pedido #${order.id}`);
            for (const item of order.items) {
                if (item.variant) {
                    const variant = await ProductVariant.findByPk(item.variant.id, { transaction: t });
                    if (variant) {
                        await variant.update({ stock: variant.stock + item.quantity }, { transaction: t });
                        console.log(`   - ${item.name} (${variant.name}): +${item.quantity}`);
                    }
                } else {
                    const product = await Product.findByPk(item.id, { transaction: t });
                    if (product) {
                        await product.update({ stock: product.stock + item.quantity }, { transaction: t });
                        console.log(`   - ${product.name}: +${item.quantity}`);
                    }
                }
            }
        }

        // Caso B: De CANCELADO a cualquier otro (Restaurar y Validar Stock)
        if (previousStatus === 'cancelled' && newStatus !== 'cancelled') {
            console.log(`📦 Restaurando stock por re-activación del pedido #${order.id}`);
            for (const item of order.items) {
                if (item.variant) {
                    const variant = await ProductVariant.findByPk(item.variant.id, { transaction: t });
                    if (!variant || variant.stock < item.quantity) {
                        await t.rollback();
                        return res.status(400).json({
                            success: false,
                            error: `Stock insuficiente para restaurar el pedido. Variante: ${item.name} - ${item.variant.name}`
                        });
                    }
                    await variant.update({ stock: variant.stock - item.quantity }, { transaction: t });
                    console.log(`   - ${item.name} (${variant.name}): -${item.quantity}`);
                } else {
                    const product = await Product.findByPk(item.id, { transaction: t });
                    if (!product || product.stock < item.quantity) {
                        await t.rollback();
                        return res.status(400).json({
                            success: false,
                            error: `Stock insuficiente para restaurar el pedido. Producto: ${item.name}`
                        });
                    }
                    await product.update({ stock: product.stock - item.quantity }, { transaction: t });
                    console.log(`   - ${product.name}: -${item.quantity}`);
                }
            }
        }

        // Actualizar datos
        if (order_status) order.order_status = order_status;
        if (payment_status) order.payment_status = payment_status;
        if (notes !== undefined) order.notes = notes;

        await order.save({ transaction: t });
        await t.commit();

        console.log(`✅ Pedido #${order.id} actualizado.`);

        // Notificar por WhatsApp si cambió el estado
        if (order_status && order_status !== previousStatus) {
            setTimeout(async () => {
                try {
                    await sendOrderMessage(order, 'update');
                } catch (error) {
                    console.error(`❌ Error enviando WhatsApp de actualización:`, error);
                }
            }, 1000);

            // Enviar email de actualización de estado
            setTimeout(async () => {
                try {
                    const result = await emailService.sendOrderStatusUpdate(order, order_status);
                    if (result.success) {
                        console.log(`✅ Email de actualización enviado para pedido #${order.id}`);
                    } else {
                        console.error(`❌ Falló el envío de email de actualización para pedido #${order.id}:`, result.error);
                    }
                } catch (error) {
                    console.error(`❌ Error enviando email de actualización:`, error);
                }
            }, 1500);
        }

        res.status(200).json({
            success: true,
            order: order,
            message: 'Pedido actualizado exitosamente'
        });
    } catch (error) {
        console.error('❌ Error actualizando pedido:', error);
        if (t) await t.rollback();
        res.status(500).json({
            success: false,
            error: 'Error al actualizar pedido',
            details: error.message
        });
    }
});

/**
 * DELETE /api/orders/:id
 * Eliminar pedido (admin)
 */
router.delete('/:id', protect, admin, async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const order = await Order.findByPk(req.params.id, { transaction: t });
        if (!order) {
            await t.rollback();
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        // Si el pedido NO estaba cancelado, debemos devolver el stock antes de borrarlo
        if (order.order_status !== 'cancelled') {
            console.log(`📦 Devolviendo stock por eliminación del pedido #${order.id}`);
            for (const item of order.items) {
                if (item.variant) {
                    const variant = await ProductVariant.findByPk(item.variant.id, { transaction: t });
                    if (variant) {
                        await variant.update({ stock: variant.stock + item.quantity }, { transaction: t });
                    }
                } else {
                    const product = await Product.findByPk(item.id, { transaction: t });
                    if (product) {
                        await product.update({ stock: product.stock + item.quantity }, { transaction: t });
                    }
                }
            }
        }

        await order.destroy({ transaction: t });
        await t.commit();

        res.json({ success: true, message: 'Pedido eliminado correctamente' });
    } catch (error) {
        console.error('❌ Error eliminando pedido:', error);
        if (t) await t.rollback();
        res.status(500).json({ success: false, error: 'Error al eliminar pedido' });
    }
});

function verifyMPSignature(req) {
    const secret = process.env.MP_WEBHOOK_SECRET;
    if (!secret) return true; // Si no está configurado, no bloquear

    const signature = req.headers['x-signature'];
    const requestId = req.headers['x-request-id'];
    if (!signature) return false;

    const parts = {};
    signature.split(',').forEach(part => {
        const [key, value] = part.split('=');
        if (key && value) parts[key.trim()] = value.trim();
    });

    const { ts, v1 } = parts;
    if (!ts || !v1) return false;

    const dataId = req.query['data.id'] || req.body?.data?.id;
    const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
    const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex');

    try {
        return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1));
    } catch {
        return false;
    }
}

/**
 * POST /api/orders/webhook
 * Webhook de Mercado Pago
 */
router.post('/webhook', async (req, res) => {
    if (!verifyMPSignature(req)) {
        console.warn('⚠️ Webhook MP con firma inválida rechazado');
        return res.status(401).send('Unauthorized');
    }

    try {
        const { type, data } = req.body;
        res.status(200).send('OK');

        if (type === 'payment') {
            const paymentId = data.id;
            const paymentInfo = await getPaymentInfo(paymentId);
            const externalRef = paymentInfo.external_reference;
            const orderId = externalRef.replace('order_', '');

            const order = await Order.findByPk(orderId);
            if (order) {
                order.payment_id = paymentId;
                switch (paymentInfo.status) {
                    case 'approved':
                        order.payment_status = 'approved';
                        order.order_status = 'processing';
                        break;
                    case 'rejected':
                        order.payment_status = 'rejected';
                        break;
                    case 'pending':
                    case 'in_process':
                        order.payment_status = 'pending';
                        break;
                    case 'refunded':
                        order.payment_status = 'refunded';
                        break;
                }
                await order.save();

                if (paymentInfo.status === 'approved') {
                    setTimeout(async () => {
                        try {
                            await sendOrderMessage(order, 'update');
                        } catch (error) {
                            console.error(`❌ Error enviando WhatsApp:`, error);
                        }
                    }, 2000);
                }
            }
        }
    } catch (error) {
        console.error('❌ Error webhook:', error);
    }
});

/**
 * POST /api/orders/:id/resend-whatsapp
 */
router.post('/:id/resend-whatsapp', protect, admin, async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);
        if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });

        const { type = 'new' } = req.body;
        const whatsappSent = await sendOrderMessage(order, type);

        if (whatsappSent) {
            res.json({ success: true, message: 'WhatsApp reenviado' });
        } else {
            res.status(400).json({ success: false, error: 'Error enviando WhatsApp' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error al reenviar WhatsApp' });
    }
});

module.exports = router;
