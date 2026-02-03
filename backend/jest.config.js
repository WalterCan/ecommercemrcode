module.exports = {
    testEnvironment: 'node',
    coverageDirectory: 'coverage',
    testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
    verbose: true,
    setupFilesAfterEnv: ['./tests/setup.js'],
    forceExit: true, // Forzar salida después de tests (útil con express/mongoose/sequelize)
    // Ignorar node_modules y otros directorios
    testPathIgnorePatterns: ['/node_modules/'],
};
