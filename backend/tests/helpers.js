const User = require('../src/models/User');
const jwt = require('jsonwebtoken');

/**
 * Crea un usuario de prueba en la base de datos
 */
const createTestUser = async (overrides = {}) => {
    const defaultUser = {
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
        password: 'password123',
        role: overrides.role || 'customer' // Priorizar rol del override o default customer
    };

    const userData = { ...defaultUser, ...overrides };
    return await User.create(userData);
};

/**
 * Genera un token JWT para un usuario
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'test-secret', {
        expiresIn: '1h'
    });
};

/**
 * Limpia la tabla de usuarios
 */
const clearUsers = async () => {
    await User.destroy({ where: {}, truncate: true });
};

module.exports = {
    createTestUser,
    generateToken,
    clearUsers
};
