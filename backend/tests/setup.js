const sequelize = require('../src/config/db');

// Configuración Global de Tests

// Aumentar timeout para todos los tests
jest.setTimeout(30000);

// Silenciar logs de consola durante los tests, excepto errores y warnings importantes
global.console = {
    ...console,
    log: jest.fn(), // Silenciar logs normales
    debug: jest.fn(), // Silenciar debug
    // info: console.info,
    // warn: console.warn,
    error: console.error,
};

// Mock de variables de entorno
process.env.JWT_SECRET = 'test-secret';
process.env.NODE_ENV = 'test';

// Hooks Globales
beforeAll(async () => {
    // Sincronizar base de datos (crear tablas) en SQLite memoria
    await sequelize.sync({ force: true });
});

afterAll(async () => {
    await sequelize.close();
});
