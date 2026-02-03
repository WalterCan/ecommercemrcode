const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const { createTestUser, clearUsers } = require('./helpers');

describe('Auth Endpoints', () => {
    let user;

    beforeEach(async () => {
        await clearUsers();
        user = await createTestUser({
            email: 'test@example.com',
            password: 'password123'
        });
    });

    afterAll(async () => {
        // await clearUsers(); // Opcional, dependiendo de la estrategia de limpieza
    });

    describe('POST /api/auth/login', () => {
        it('should login successfully with correct credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body.user).toHaveProperty('email', 'test@example.com');
        });

        it('should return 401 with invalid password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty('message', 'Credenciales inválidas');
        });

        it('should return 401 if user not found', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'password123'
                });

            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty('message', 'Credenciales inválidas');
        });
    });
});
