const { sequelize } = require('../src/models');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function runHealthCheck() {
  console.log('🔍 Iniciando Diagnóstico de Salud del Sistema...\n');
  let hasErrors = false;

  // 1. Probar conexión a MySQL
  try {
    process.stdout.write('📦 Conectando a MySQL... ');
    await sequelize.authenticate();
    console.log('✅ OK');
  } catch (error) {
    console.log('❌ FALLÓ');
    console.error('   Motivo:', error.message);
    hasErrors = true;
  }

  // 2. Probar carpeta de Uploads
  try {
    process.stdout.write('📂 Verificando carpeta /uploads... ');
    const uploadsPath = path.join(__dirname, '../uploads');
    
    if (!fs.existsSync(uploadsPath)) {
       console.log('⚠️ NO EXISTE, intentando crearla...');
       fs.mkdirSync(uploadsPath, { recursive: true });
    }

    // Probar escritura
    const testFile = path.join(uploadsPath, '.test_write');
    fs.writeFileSync(testFile, 'ok');
    fs.unlinkSync(testFile);
    console.log('✅ OK (Lectura/Escritura verificada)');

  } catch (error) {
    console.log('❌ FALLÓ');
    console.error('   Motivo: Problemas de permisos. ' + error.message);
    console.error('   Solución: Corre "chmod -R 777 backend/uploads"');
    hasErrors = true;
  }

  console.log('\n----------------------------------------');
  if (hasErrors) {
    console.log('⚠️  DIAGNÓSTICO COMPLETADO CON ERRORES.');
    process.exit(1);
  } else {
    console.log('🚀 TODO VERDE! El backend está listo para producción.');
    process.exit(0);
  }
}

runHealthCheck();
