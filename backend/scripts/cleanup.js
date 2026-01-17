// D:\PROYECTOS\tiendavirtual\backend\scripts\cleanup.js
const fs = require('fs');
const path = require('path');

console.log('🧹 Limpiando sesiones y locks de WhatsApp...');

// Limpiar sesiones de WhatsApp
const sessionsDir = path.join(__dirname, '../whatsapp_sessions');
if (fs.existsSync(sessionsDir)) {
    fs.rmSync(sessionsDir, { recursive: true, force: true });
    console.log('✅ Sesiones de WhatsApp eliminadas');
}

// Limpiar directorio temporal de Chromium
const tmpChromium = '/tmp/chromium-profile';
if (fs.existsSync(tmpChromium)) {
    fs.rmSync(tmpChromium, { recursive: true, force: true });
    console.log('✅ Perfil temporal de Chromium eliminado');
}

// Limpiar archivos lock en /tmp
const tmpDir = '/tmp';
if (fs.existsSync(tmpDir)) {
    const files = fs.readdirSync(tmpDir);
    let lockCount = 0;
    files.forEach(file => {
        if (file.includes('Singleton') || file.includes('chromium') || file.endsWith('.lock')) {
            try {
                const filePath = path.join(tmpDir, file);
                const stat = fs.statSync(filePath);
                if (stat.isFile()) {
                    fs.unlinkSync(filePath);
                    lockCount++;
                } else if (stat.isDirectory()) {
                    fs.rmSync(filePath, { recursive: true, force: true });
                    lockCount++;
                }
            } catch (e) {
                // Ignorar errores
            }
        }
    });
    if (lockCount > 0) {
        console.log(`✅ ${lockCount} archivos lock eliminados de /tmp`);
    }
}

console.log('✨ Limpieza completada. Reinicia el servidor.');