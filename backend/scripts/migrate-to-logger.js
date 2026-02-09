const fs = require('fs');
const path = require('path');

/**
 * Script para migrar console.log/error a logger estructurado
 * Reemplaza automáticamente en todos los archivos de controllers
 */

const controllersDir = path.join(__dirname, '../src/controllers');

// Función para procesar un archivo
function migrateFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Verificar si ya tiene el import del logger
    if (!content.includes("require('./utils/logger')") && !content.includes("require('../utils/logger')")) {
        // Agregar import del logger después de los otros requires
        const firstRequire = content.indexOf('const');
        if (firstRequire !== -1) {
            const loggerImport = "const logger = require('../utils/logger');\n";
            content = content.slice(0, firstRequire) + loggerImport + content.slice(firstRequire);
            modified = true;
        }
    }

    // Reemplazar console.log por logger.info
    const logRegex = /console\.log\((.*?)\);/g;
    if (logRegex.test(content)) {
        content = content.replace(/console\.log\((.*?)\);/g, 'logger.info($1);');
        modified = true;
    }

    // Reemplazar console.error por logger.error
    const errorRegex = /console\.error\((.*?)\);/g;
    if (errorRegex.test(content)) {
        content = content.replace(/console\.error\((.*?)\);/g, 'logger.error($1);');
        modified = true;
    }

    // Reemplazar console.warn por logger.warn
    const warnRegex = /console\.warn\((.*?)\);/g;
    if (warnRegex.test(content)) {
        content = content.replace(/console\.warn\((.*?)\);/g, 'logger.warn($1);');
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Migrado: ${path.basename(filePath)}`);
        return true;
    }

    return false;
}

// Procesar todos los archivos en controllers
const files = fs.readdirSync(controllersDir);
let migratedCount = 0;

files.forEach(file => {
    if (file.endsWith('.js')) {
        const filePath = path.join(controllersDir, file);
        if (migrateFile(filePath)) {
            migratedCount++;
        }
    }
});

console.log(`\n🎉 Migración completada: ${migratedCount} archivos actualizados`);
