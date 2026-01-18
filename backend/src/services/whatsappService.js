// D:\PROYECTOS\tiendavirtual\backend\src\services\whatsappService.js
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const path = require('path');
const fs = require('fs');
const Setting = require('../models/Setting');

// Variables de estado global
let qrCodeData = null;
let connectionStatus = 'disconnected';
let connectionInfo = {
    phoneNumber: null,
    lastConnection: null,
    isConnected: false
};

let client = null;
let isInitializing = false;
let qrGenerated = false;

/**
 * Configuración ULTRA ESTABLE para Chromium en Docker
 */
const getPuppeteerConfig = () => {
    return {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-features=ProcessSingleton',
            '--disable-software-rasterizer',
            '--disable-background-networking',
            '--disable-default-apps',
            '--disable-extensions',
            '--disable-sync',
            '--disable-translate',
            '--metrics-recording-only',
            '--mute-audio',
            '--no-default-browser-check',
            '--disable-component-update',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--disable-client-side-phishing-detection',
            '--disable-crash-reporter',
            '--disable-ipc-flooding-protection',
            '--disable-prompt-on-repost',
            '--disable-hang-monitor',
            '--disable-popup-blocking',
            '--disable-prompt-on-repost',
            '--disable-web-security',
            '--enable-automation',
            '--password-store=basic',
            '--use-mock-keychain',
            '--user-data-dir=/app/whatsapp_sessions/chrome_profile',
            '--remote-debugging-port=9222',
            '--remote-debugging-address=0.0.0.0'
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser',
        ignoreDefaultArgs: ['--disable-extensions', '--enable-automation'],
        ignoreHTTPSErrors: true,
        defaultViewport: null,
        timeout: 60000
    };
};

/**
 * Limpiar todo completamente
 */
const cleanEverything = () => {
    try {
        console.log('🧹 Limpiando sistema...');

        // Cerrar cliente si existe
        if (client) {
            try {
                client.destroy();
            } catch (e) { }
            client = null;
        }

        // Eliminar sesiones
        const sessionDir = path.join(__dirname, '../../whatsapp_sessions');
        if (fs.existsSync(sessionDir)) {
            fs.rmSync(sessionDir, { recursive: true, force: true });
            console.log('✅ Sesiones eliminadas');
        }

        // Crear directorio limpio
        fs.mkdirSync(sessionDir, { recursive: true });
        console.log('✅ Directorio de sesiones creado');

        // Resetear estado
        qrCodeData = null;
        connectionStatus = 'disconnected';
        connectionInfo.isConnected = false;
        connectionInfo.phoneNumber = null;
        qrGenerated = false;
        isInitializing = false;

    } catch (error) {
        console.log('⚠️ Error en limpieza:', error.message);
    }
};

/**
 * Eliminar bloqueos de Chromium para permitir reinicios limpios
 */
const clearChromeLocks = () => {
    try {
        const profilePath = '/app/whatsapp_sessions/chrome_profile';
        if (!fs.existsSync(profilePath)) return;

        console.log('🧹 Buscando bloqueos de Chromium...');
        const files = fs.readdirSync(profilePath);

        console.log(`🧹 Archivos en perfil: ${files.join(', ')}`);

        const forceLockFiles = ['SingletonLock', 'SingletonCookie', 'SingletonSocket'];
        forceLockFiles.forEach(file => {
            const filePath = path.join(profilePath, file);
            try {
                fs.unlinkSync(filePath);
                console.log(`🔓 Bloqueo eliminado (fuerza): ${file}`);
            } catch (e) { }
        });

        files.forEach(file => {
            if (file.toLowerCase().includes('lock')) {
                const filePath = path.join(profilePath, file);
                try {
                    fs.unlinkSync(filePath);
                    console.log(`🔓 Archivo lock eliminado: ${file}`);
                } catch (e) { }
            }
        });
    } catch (error) {
        console.log('⚠️ Error limpiando bloqueos de Chrome:', error.message);
    }
};

/**
 * Inicializar WhatsApp con manejo de errores mejorado
 */
const initializeWhatsApp = async () => {
    if (isInitializing) {
        console.log('⏳ Ya se está inicializando...');
        return;
    }

    isInitializing = true;
    connectionStatus = 'initializing';

    try {
        console.log('🚀 Iniciando WhatsApp Web...');

        // NOTA: No limpiamos sesiones automáticamente para permitir persistencia
        // Pero SÍ limpiamos los bloqueos de Chromium para evitar errores al reiniciar
        clearChromeLocks();
        // cleanEverything();

        // Configuración del cliente
        const clientConfig = {
            authStrategy: new LocalAuth({
                clientId: 'tienda-holistica',
                dataPath: path.join(__dirname, '../../whatsapp_sessions')
            }),
            puppeteer: getPuppeteerConfig(),
            webVersionCache: {
                type: "remote",
                remotePath: "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.3000.1018911011-alpha.html"
            }
        };

        console.log('⚙️ Configurando cliente...');
        client = new Client(clientConfig);

        // =========== MANEJO DE EVENTOS ===========

        // QR - SOLO UNA VEZ
        client.on('qr', async (qr) => {
            if (!qrGenerated) {
                console.log('🔐 QR GENERADO!');
                console.log('⏳ Este QR es válido por 2 minutos');

                try {
                    qrCodeData = await qrcode.toDataURL(qr);
                    qrGenerated = true;
                    connectionStatus = 'qr_pending';

                    console.log('✅ QR convertido a imagen');
                    console.log('\n📱 INSTRUCCIONES:');
                    console.log('   1. Abre WhatsApp en tu teléfono');
                    console.log('   2. Menú → Dispositivos vinculados');
                    console.log('   3. "Vincular dispositivo"');
                    console.log('   4. Escanea este código QR');

                } catch (error) {
                    console.error('❌ Error generando QR:', error.message);
                }
            } else {
                console.log('ℹ️ QR ya generado, ignorando nuevo');
            }
        });

        client.on('ready', () => {
            console.log('✅ WHATSAPP CONECTADO Y LISTO!');
            connectionStatus = 'connected';
            connectionInfo.isConnected = true;
            connectionInfo.lastConnection = new Date();
            qrCodeData = null;

            // Obtener número de forma SEGURA
            setTimeout(async () => {
                try {
                    // ESPERAR más tiempo para que la info esté disponible
                    await new Promise(resolve => setTimeout(resolve, 5000));

                    // Intentar múltiples formas de obtener el número
                    if (client.info) {
                        // Forma 1: client.info.me.id.user
                        if (client.info.me && client.info.me.id) {
                            if (client.info.me.id.user) {
                                connectionInfo.phoneNumber = client.info.me.id.user;
                                console.log(`📱 Conectado como: ${connectionInfo.phoneNumber}`);
                                return;
                            } else if (client.info.me.id._serialized) {
                                connectionInfo.phoneNumber = client.info.me.id._serialized.split('@')[0];
                                console.log(`📱 Conectado como: ${connectionInfo.phoneNumber}`);
                                return;
                            }
                        }

                        // Forma 2: client.info.wid
                        if (client.info.wid) {
                            if (client.info.wid.user) {
                                connectionInfo.phoneNumber = client.info.wid.user;
                                console.log(`📱 Conectado (wid): ${connectionInfo.phoneNumber}`);
                                return;
                            } else if (client.info.wid._serialized) {
                                connectionInfo.phoneNumber = client.info.wid._serialized.split('@')[0];
                                console.log(`📱 Conectado (wid): ${connectionInfo.phoneNumber}`);
                                return;
                            }
                        }

                        // Forma 3: client.info._serialized
                        if (client.info._serialized) {
                            connectionInfo.phoneNumber = client.info._serialized.split('@')[0];
                            console.log(`📱 Conectado (_serialized): ${connectionInfo.phoneNumber}`);
                            return;
                        }
                    }

                    // Si nada funciona, intentar getHostDevice (si existe)
                    if (typeof client.getHostDevice === 'function') {
                        try {
                            const me = await client.getHostDevice();
                            if (me && me.id) {
                                connectionInfo.phoneNumber = me.id.user || me.id._serialized?.split('@')[0];
                                console.log(`📱 Conectado (getHostDevice): ${connectionInfo.phoneNumber}`);
                                return;
                            }
                        } catch (deviceError) {
                            console.log('⚠️ getHostDevice falló:', deviceError.message);
                        }
                    }

                    console.log('ℹ️ Número no disponible (pero WhatsApp está conectado)');

                } catch (error) {
                    console.log('⚠️ Error obteniendo número:', error.message);
                    console.log('⚠️ Info disponible:', JSON.stringify(client.info, null, 2));
                }
            }, 8000); // Esperar 8 segundos
        });

        // AUTHENTICATED
        client.on('authenticated', () => {
            console.log('✅ WhatsApp autenticado');
        });

        // AUTH FAILURE
        client.on('auth_failure', (msg) => {
            console.error('❌ Error de autenticación:', msg);
            connectionStatus = 'auth_failure';
            qrCodeData = null;
        });

        // DISCONNECTED
        client.on('disconnected', (reason) => {
            console.log('❌ WhatsApp desconectado:', reason);
            connectionStatus = 'disconnected';
            connectionInfo.isConnected = false;
            connectionInfo.phoneNumber = null;
            qrCodeData = null;
            qrGenerated = false;
        });

        // LOADING SCREEN
        client.on('loading_screen', (percent, message) => {
            console.log(`📱 Cargando: ${percent}% - ${message}`);
        });

        // INICIALIZAR
        console.log('🎯 Inicializando cliente...');
        try {
            await client.initialize();
        } catch (initError) {
            console.log('⚠️ Error en primer intento de inicialización:', initError.message);
            if (initError.message.includes('Failed to launch') || initError.message.includes('profile in use')) {
                console.log('🔄 Reintentando tras limpieza de emergencia...');
                clearChromeLocks();
                await new Promise(r => setTimeout(r, 3000));
                await client.initialize();
            } else {
                throw initError;
            }
        }

        console.log('✅ WhatsApp inicializado correctamente');
        console.log('⏳ Esperando QR o conexión...');

    } catch (error) {
        console.error('❌ ERROR inicializando WhatsApp:', error.message);

        // Diagnóstico específico del error
        if (error.message.includes('Session closed') ||
            error.message.includes('Protocol error') ||
            error.message.includes('Most likely the page has been closed')) {

            console.log('🔧 DIAGNÓSTICO: Chromium se está cerrando inmediatamente');
            console.log('🔧 POSIBLES CAUSAS:');
            console.log('   1. Falta de memoria en Docker');
            console.log('   2. Conflictos con puppeteer');
            console.log('   3. Chromium no compatible');

            // Intentar solución automática
            console.log('🔄 Intentando solución alternativa...');

            // Esperar y limpiar
            await new Promise(resolve => setTimeout(resolve, 5000));
            cleanEverything();

            // No reintentar automáticamente
            console.log('🔄 Listo para reintentar manualmente');
        }

        connectionStatus = 'error';

    } finally {
        isInitializing = false;
    }
};

// Iniciar después de 8 segundos
setTimeout(() => {
    console.log('⏰ Iniciando WhatsApp en 8 segundos...');
    setTimeout(() => {
        initializeWhatsApp();
    }, 8000);
}, 3000);

/**
 * Obtener estado
 */
const getWhatsAppStatus = async () => {
    return {
        status: connectionStatus,
        isConnected: connectionInfo.isConnected,
        phoneNumber: connectionInfo.phoneNumber,
        lastConnection: connectionInfo.lastConnection,
        qr: qrCodeData,
        timestamp: new Date(),
        message: getStatusMessage(connectionStatus)
    };
};

const getStatusMessage = (status) => {
    const messages = {
        'disconnected': 'WhatsApp no conectado',
        'qr_pending': 'Escanea el QR con WhatsApp',
        'connected': '✅ WhatsApp conectado',
        'initializing': 'Inicializando...',
        'error': '❌ Error de conexión'
    };
    return messages[status] || 'Estado desconocido';
};

/**
 * Obtener QR
 */
const getQRCode = () => {
    return {
        qr: qrCodeData,
        status: connectionStatus,
        timestamp: new Date()
    };
};

/**
 * Regenerar QR
 */
const regenerateQR = async () => {
    try {
        console.log('🔄 Solicitando nuevo QR...');

        // Limpiar estado
        qrCodeData = null;
        qrGenerated = false;

        // Cerrar cliente si existe
        if (client) {
            try {
                await client.destroy();
            } catch (e) {
                console.log('⚠️ Error cerrando:', e.message);
            }
            client = null;
        }

        // Limpiar sesiones
        const sessionDir = path.join(__dirname, '../../whatsapp_sessions');
        if (fs.existsSync(sessionDir)) {
            fs.rmSync(sessionDir, { recursive: true, force: true });
        }

        // Esperar
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Reiniciar
        connectionStatus = 'disconnected';
        await initializeWhatsApp();

        // Esperar QR
        await new Promise(resolve => setTimeout(resolve, 5000));

        return {
            success: true,
            message: 'QR regenerado',
            qr: qrCodeData,
            status: connectionStatus,
            timestamp: new Date()
        };

    } catch (error) {
        console.error('❌ Error regenerando QR:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Desconectar
 */
const disconnectWhatsApp = async () => {
    try {
        if (client) {
            await client.destroy();
            client = null;
        }

        cleanEverything();

        console.log('✅ WhatsApp desconectado');
        return { success: true, message: 'Desconectado' };

    } catch (error) {
        console.error('❌ Error desconectando:', error);
        return { success: false, error: error.message };
    }
};

const getSiteName = async () => {
    try {
        const setting = await Setting.findOne({ where: { key: 'site_name' } });
        return setting ? setting.value : 'Tienda Holística';
    } catch (error) {
        return 'Tienda Holística';
    }
};

const getPaymentMethodName = (method) => {
    const methods = {
        'mercadopago': 'Mercado Pago',
        'transfer': 'Transferencia Bancaria',
        'whatsapp': 'Coordinar por WhatsApp',
        'cash': 'Efectivo'
    };
    return methods[method] || method;
};

const getStatusName = (status) => {
    const statuses = {
        'pending': 'Pendiente',
        'processing': 'En Proceso',
        'shipped': 'Enviado',
        'delivered': 'Entregado',
        'cancelled': 'Cancelado'
    };
    return statuses[status] || status;
};

const getShippingMethodName = (method) => {
    const methods = {
        'pickup': 'Retiro en sucursal',
        'shipping': 'Envío a domicilio',
        'delivery': 'Envío local'
    };
    return methods[method] || method;
};

const sendTestMessage = async (phoneNumber) => {
    if (!client || connectionStatus !== 'connected') {
        return {
            success: false,
            error: 'Conecta WhatsApp primero',
            status: connectionStatus
        };
    }

    try {
        const siteName = await getSiteName();
        // Limpiar número
        let cleanNumber = phoneNumber.replace(/\D/g, '');
        console.log(`🔍 Intentando enviar prueba a: ${cleanNumber}`);

        // Intentar obtener el ID oficial de WhatsApp (maneja WID y LID)
        let targetId = `${cleanNumber}@c.us`;
        try {
            const numberId = await client.getNumberId(cleanNumber);
            if (numberId) {
                targetId = numberId._serialized;
                console.log(`✅ ID resuelto: ${targetId}`);
            } else {
                console.log(`⚠️ No se pudo resolver ID oficial, usando genérico: ${targetId}`);
            }
        } catch (idErr) {
            console.log(`⚠️ Error resolviendo ID: ${idErr.message}`);
        }

        await client.sendMessage(targetId, `¡Hola! Este es un mensaje de prueba desde tu *${siteName}*. 👋`, { sendSeen: false });

        return {
            success: true,
            message: 'Mensaje de prueba enviado correctamente'
        };
    } catch (error) {
        console.error('Error enviando mensaje de prueba:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

const sendOrderMessage = async (order, type = 'new') => {
    if (!client || connectionStatus !== 'connected') {
        console.log('⚠️ No se pudo enviar WhatsApp: Cliente no conectado');
        return false;
    }

    try {
        const siteName = await getSiteName();
        let phoneNumber = order.customer_phone.replace(/\D/g, '');

        // Intentar obtener el ID oficial
        let targetId = `${phoneNumber}@c.us`;
        try {
            const numberId = await client.getNumberId(phoneNumber);
            if (numberId) {
                targetId = numberId._serialized;
            }
        } catch (err) { }

        let message = '';
        if (type === 'new') {
            message = `*¡Hola ${order.customer_name}!* 👋\n\n` +
                `Gracias por tu compra en *${siteName}*.\n` +
                `Hemos recibido tu pedido *#${order.id}*.\n\n` +
                `*Resumen:* \n` +
                `- Total: $${order.total}\n` +
                `- Pago: ${getPaymentMethodName(order.payment_method)}\n` +
                `- Envío: ${getShippingMethodName(order.shipping_method)}\n\n` +
                `Te avisaremos cuando haya novedades. ¡Gracias! ✨`;
        } else if (type === 'status_update' || type === 'update') {
            message = `*Hola ${order.customer_name}* 👋\n\n` +
                `Tu pedido *#${order.id}* ha cambiado de estado a: *${getStatusName(order.order_status)}*.\n\n` +
                `¡Gracias por tu paciencia! ✨`;
        }

        await client.sendMessage(targetId, message, { sendSeen: false });
        console.log(`✅ WhatsApp enviado para pedido #${order.id}`);
        return true;
    } catch (error) {
        console.error(`❌ Error enviando WhatsApp para pedido #${order.id}:`, error);
        return false;
    }
};

module.exports = {
    sendOrderMessage,
    getWhatsAppStatus,
    getQRCode,
    regenerateQR,
    disconnectWhatsApp,
    sendTestMessage,
    cleanEverything,
    initializeWhatsApp  // Exportar para poder llamarla manualmente
};