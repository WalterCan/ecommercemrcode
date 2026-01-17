const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');
const Setting = require('../models/Setting');

/**
 * Servicio de Email usando Nodemailer
 * Soporta Gmail, SendGrid, y otros proveedores SMTP
 */
class EmailService {
    /**
     * Obtener configuración de email (DB o ENV)
     */
    async getConfig() {
        try {
            // Intentar buscar en DB
            const settings = await Setting.findAll({
                where: {
                    key: ['email_host', 'email_port', 'email_user', 'email_password', 'email_secure', 'email_from_name']
                }
            });

            const dbConfig = {};
            settings.forEach(s => dbConfig[s.key] = s.value);

            // Prioridad: DB > ENV
            return {
                host: dbConfig.email_host || process.env.EMAIL_HOST || 'smtp.gmail.com',
                port: parseInt(dbConfig.email_port || process.env.EMAIL_PORT) || 587,
                secure: dbConfig.email_secure === 'true' || process.env.EMAIL_SECURE === 'true',
                auth: {
                    user: dbConfig.email_user || process.env.EMAIL_USER,
                    pass: dbConfig.email_password || process.env.EMAIL_PASSWORD
                },
                fromName: dbConfig.email_from_name || process.env.EMAIL_FROM_NAME || 'Tienda Holística'
            };
        } catch (error) {
            console.error('Error fetching email config:', error);
            // Fallback a ENV si falla la DB
            return {
                host: process.env.EMAIL_HOST || 'smtp.gmail.com',
                port: parseInt(process.env.EMAIL_PORT) || 587,
                secure: process.env.EMAIL_SECURE === 'true',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                },
                fromName: process.env.EMAIL_FROM_NAME || 'Tienda Holística'
            };
        }
    }

    /**
     * Cargar y compilar template de Handlebars
     */
    async loadTemplate(templateName, data) {
        try {
            const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.hbs`);
            const templateContent = await fs.readFile(templatePath, 'utf-8');
            const template = handlebars.compile(templateContent);
            return template(data);
        } catch (error) {
            console.error(`Error loading email template ${templateName}:`, error);
            throw error;
        }
    }

    /**
     * Enviar email genérico
     */
    async sendEmail({ to, subject, html, text }) {
        const config = await this.getConfig();

        if (!config.auth.user || !config.auth.pass) {
            console.warn('Email service not configured. Skipping email send.');
            return { success: false, error: 'Email service not configured' };
        }

        const transporter = nodemailer.createTransport(config);

        try {
            const mailOptions = {
                from: `"${config.fromName}" <${config.auth.user}>`,
                to,
                subject,
                html,
                text: text || html.replace(/<[^>]*>/g, '') // Fallback a texto plano
            };

            const info = await transporter.sendMail(mailOptions);
            console.log('✅ Email sent:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Error sending email:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Enviar confirmación de pedido
     */
    async sendOrderConfirmation(orderData) {
        try {
            const html = await this.loadTemplate('orderConfirmation', {
                customerName: orderData.customer_name,
                orderId: orderData.id,
                orderDate: new Date(orderData.createdAt).toLocaleDateString('es-AR'),
                items: orderData.items,
                subtotal: orderData.total - orderData.shipping_cost,
                shippingCost: orderData.shipping_cost,
                discount: orderData.discount_amount,
                total: orderData.total,
                paymentMethod: this.getPaymentMethodName(orderData.payment_method),
                shippingMethod: orderData.shipping_method === 'pickup' ? 'Retiro en sucursal' : 'Envío a domicilio',
                address: orderData.customer_address,
                city: orderData.customer_city,
                postalCode: orderData.customer_postal_code
            });

            return await this.sendEmail({
                to: orderData.customer_email,
                subject: `Confirmación de Pedido #${orderData.id} - Tienda Holística`,
                html
            });
        } catch (error) {
            console.error('Error sending order confirmation:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Enviar actualización de estado de pedido
     */
    async sendOrderStatusUpdate(orderData, newStatus) {
        try {
            const html = await this.loadTemplate('orderStatusUpdate', {
                customerName: orderData.customer_name,
                orderId: orderData.id,
                status: this.getStatusName(newStatus),
                statusMessage: this.getStatusMessage(newStatus),
                trackingUrl: orderData.tracking_url || null
            });

            return await this.sendEmail({
                to: orderData.customer_email,
                subject: `Actualización de Pedido #${orderData.id} - ${this.getStatusName(newStatus)}`,
                html
            });
        } catch (error) {
            console.error('Error sending order status update:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Enviar email de recuperación de contraseña
     */
    async sendPasswordReset(userData, resetToken) {
        try {
            const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

            const html = await this.loadTemplate('passwordReset', {
                name: userData.name || 'Usuario',
                resetUrl,
                expirationTime: '1 hora'
            });

            return await this.sendEmail({
                to: userData.email,
                subject: 'Recuperación de Contraseña - Tienda Holística',
                html
            });
        } catch (error) {
            console.error('Error sending password reset email:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Helpers para nombres legibles
     */
    getPaymentMethodName(method) {
        const methods = {
            'mercadopago': 'Mercado Pago',
            'transfer': 'Transferencia Bancaria',
            'whatsapp': 'Coordinar por WhatsApp',
            'cash': 'Efectivo'
        };
        return methods[method] || method;
    }

    getStatusName(status) {
        const statuses = {
            'pending': 'Pendiente',
            'processing': 'En Proceso',
            'shipped': 'Enviado',
            'delivered': 'Entregado',
            'cancelled': 'Cancelado'
        };
        return statuses[status] || status;
    }

    getStatusMessage(status) {
        const messages = {
            'pending': 'Tu pedido está pendiente de confirmación de pago.',
            'processing': 'Estamos preparando tu pedido con mucho amor y dedicación.',
            'shipped': 'Tu pedido está en camino. ¡Pronto estará contigo!',
            'delivered': 'Tu pedido ha sido entregado. ¡Disfruta tus productos holísticos!',
            'cancelled': 'Tu pedido ha sido cancelado. Si tienes dudas, contáctanos.'
        };
        return messages[status] || 'Estado actualizado.';
    }
}

// Exportar instancia única (singleton)
module.exports = new EmailService();
