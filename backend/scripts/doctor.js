const fs = require('fs');
const path = require('path');
require('dotenv').config();
const sequelize = require('../src/config/db');

// Colores para consola
const colors = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    bold: "\x1b[1m"
};

const logPass = (msg) => console.log(`${colors.green}✅ PASS:${colors.reset} ${msg}`);
const logFail = (msg) => console.log(`${colors.red}❌ FAIL:${colors.reset} ${msg}`);
const logWarn = (msg) => console.log(`${colors.yellow}⚠️ WARN:${colors.reset} ${msg}`);
const logInfo = (msg) => console.log(`${colors.blue}ℹ️ INFO:${colors.reset} ${msg}`);

async function runDoctor() {
    console.log(`${colors.bold}\n🏥 Starting System Health Check (Doctor)...\n${colors.reset}`);
    let issues = 0;

    // 1. CHEQUEO DE ENTORNO NODE
    console.log(`${colors.bold}1. Environment & Runtime${colors.reset}`);
    const nodeVersion = process.version;
    logInfo(`Node Version: ${nodeVersion}`);
    if (parseInt(nodeVersion.replace('v', '').split('.')[0]) < 18) {
        logWarn('Node version is older than recommended (v18+).');
    } else {
        logPass('Node version is compatible.');
    }

    // 2. CHEQUEO DE VARIABLES DE ENTORNO
    console.log(`\n${colors.bold}2. Environment Variables (.env)${colors.reset}`);
    const requiredVars = [
        'PORT',
        'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST',
        'JWT_SECRET'
    ];

    requiredVars.forEach(varName => {
        if (!process.env[varName]) {
            logFail(`Missing variable: ${varName}`);
            issues++;
        } else {
            logPass(`Variable ${varName} is set.`);
        }
    });

    // 3. CHEQUEO DE BASE DE DATOS
    console.log(`\n${colors.bold}3. Database Connection${colors.reset}`);
    try {
        await sequelize.authenticate();
        logPass('Database connection established successfully.');
    } catch (error) {
        logFail(`Unable to connect to the database: ${error.message}`);
        if (error.original && error.original.code === 'ENOTFOUND') {
            logWarn(`It seems like the DB host '${process.env.DB_HOST}' is not reachable.`);
            logWarn(`💡 TIP: If you are running this outside Docker, try changing DB_HOST to 'localhost' in .env`);
        }
        issues++;
    }

    // 4. CHEQUEO DE SISTEMA DE ARCHIVOS (UPLOADS)
    console.log(`\n${colors.bold}4. File System Permissions${colors.reset}`);
    const uploadsDir = path.join(__dirname, '../uploads');

    try {
        if (!fs.existsSync(uploadsDir)) {
            logWarn(`'uploads' directory does not exist. Attempting to create...`);
            fs.mkdirSync(uploadsDir);
            logPass(`'uploads' directory created.`);
        } else {
            logPass(`'uploads' directory exists.`);
        }

        // Test write permission
        const testFile = path.join(uploadsDir, 'doctor_test.txt');
        fs.writeFileSync(testFile, 'Health check write test');
        fs.unlinkSync(testFile);
        logPass(`'uploads' directory is writable.`);

    } catch (error) {
        logFail(`FileSystem Error: ${error.message}`);
        issues++;
    }

    // RESUMEN
    console.log(`\n${colors.bold}=== DIAGNOSIS SUMMARY ===${colors.reset}`);
    if (issues === 0) {
        console.log(`${colors.green}${colors.bold}✨ SYSTEM HEALTHY! No issues found.${colors.reset}\n`);
        process.exit(0);
    } else {
        console.log(`${colors.red}${colors.bold}🚨 FOUND ${issues} ISSUES. Please fix them before deploying.${colors.reset}\n`);
        process.exit(1);
    }
}

runDoctor();
