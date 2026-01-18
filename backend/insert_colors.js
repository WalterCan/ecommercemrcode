const mysql = require('mysql2/promise');
require('dotenv').config();

const colorSettings = [
    { key: 'theme_primary_color', value: '#10B981', description: 'Color primario (botones, enlaces)' },
    { key: 'theme_secondary_color', value: '#059669', description: 'Color secundario (acentos, destacados)' },
    { key: 'theme_background_color', value: '#F0FDF4', description: 'Color de fondo principal' },
    { key: 'theme_background_secondary', value: '#D1FAE5', description: 'Color de fondo secundario' },
    { key: 'theme_text_primary', value: '#1E293B', description: 'Color de texto principal' },
    { key: 'theme_text_secondary', value: '#64748B', description: 'Color de texto secundario' }
];

async function insertColorSettings() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3309,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'root',
            database: process.env.DB_NAME || 'ecommercemrcode'
        });

        console.log('✅ Conectado a la base de datos');

        for (const setting of colorSettings) {
            const [existing] = await connection.execute(
                'SELECT * FROM settings WHERE `key` = ?',
                [setting.key]
            );

            if (existing.length > 0) {
                await connection.execute(
                    'UPDATE settings SET value = ?, description = ? WHERE `key` = ?',
                    [setting.value, setting.description, setting.key]
                );
                console.log(`🔄 Actualizado: ${setting.key} = ${setting.value}`);
            } else {
                await connection.execute(
                    'INSERT INTO settings (`key`, value, description) VALUES (?, ?, ?)',
                    [setting.key, setting.value, setting.description]
                );
                console.log(`➕ Insertado: ${setting.key} = ${setting.value}`);
            }
        }

        console.log('\n✅ Configuraciones de colores insertadas correctamente');
        console.log('🎨 Colores configurados:');
        colorSettings.forEach(s => {
            console.log(`   ${s.key}: ${s.value}`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

insertColorSettings();
