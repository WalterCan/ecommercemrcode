// D:\PROYECTOS\tiendavirtual\backend\setup-whatsapp.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 CONFIGURACIÓN DE WHATSAPP ESTABLE 🔧');
console.log('=======================================');

try {
    // 1. Verificar dependencias
    console.log('\n1. Verificando dependencias...');
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    if (!packageJson.dependencies['whatsapp-web.js']) {
        console.log('📦 Instalando whatsapp-web.js...');
        execSync('npm install whatsapp-web.js qrcode', { stdio: 'inherit' });
        console.log('✅ Dependencias instaladas');
    } else {
        console.log('✅ Dependencias ya instaladas');
    }

    // 2. Limpiar todo
    console.log('\n2. Limpiando sistema...');
    const sessionDir = path.join(__dirname, 'whatsapp_sessions');
    if (fs.existsSync(sessionDir)) {
        fs.rmSync(sessionDir, { recursive: true, force: true });
        console.log('✅ Sesiones eliminadas');
    }

    // 3. Crear directorio limpio
    fs.mkdirSync(sessionDir, { recursive: true });
    fs.writeFileSync(path.join(sessionDir, '.gitignore'), '*\n!.gitignore');
    console.log('✅ Directorio de sesiones creado');

    // 4. Verificar puerto
    console.log('\n3. Verificando configuración...');
    const envPath = path.join(__dirname, '.env');
    let envContent = '';

    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');

        // Asegurar puerto 3001
        if (!envContent.includes('PORT=3001')) {
            envContent = envContent.replace(/PORT=.*\n/, 'PORT=3001\n');
            if (!envContent.includes('PORT=')) {
                envContent += '\nPORT=3001\n';
            }
            fs.writeFileSync(envPath, envContent);
            console.log('✅ Puerto configurado a 3001');
        } else {
            console.log('✅ Puerto ya configurado correctamente');
        }
    } else {
        console.log('⚠️ Archivo .env no encontrado');
    }

    console.log('\n✨ CONFIGURACIÓN COMPLETADA ✨');
    console.log('\nPasos siguientes:');
    console.log('1. Reinicia el servidor: docker-compose up -d --build');
    console.log('2. Solo deberías ver UN QR generado');
    console.log('3. Escanea el QR con WhatsApp');
    console.log('\n⚠️ IMPORTANTE: El QR es válido por 2 minutos');
    console.log('   Si expira, usa "Regenerar QR" en el panel');

} catch (error) {
    console.error('❌ Error en configuración:', error.message);
    process.exit(1);
}