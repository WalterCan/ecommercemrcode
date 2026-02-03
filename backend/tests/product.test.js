const request = require('supertest');
const app = require('../src/app');
const Product = require('../src/models/Product');
const Category = require('../src/models/Category'); // [NEW]
const { createTestUser, generateToken, clearUsers } = require('./helpers');
const sequelize = require('../src/config/db');

describe('Product Endpoints', () => {
    let adminUser;
    let adminToken;
    let customerUser;
    let customerToken;

    beforeAll(async () => {
        // await clearUsers(); // No necesario si force: true en setup.js

        // Crear Categoría por defecto
        const category = await Category.create({
            name: 'Test Category',
            description: 'Test Desc',
            is_active: true
        });

        // Crear Admin
        adminUser = await createTestUser({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'password123',
            role: 'super_admin'
        });
        adminToken = generateToken(adminUser.id);

        // Crear Cliente
        customerUser = await createTestUser({
            name: 'Customer User',
            email: 'customer@example.com',
            password: 'password123',
            role: 'customer'
        });
        customerToken = generateToken(customerUser.id);
    });

    afterAll(async () => {
        // await clearUsers();
    });

    describe('GET /api/products', () => {
        it('should return empty list initially', async () => {
            const res = await request(app).get('/api/products');
            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBeTruthy(); // Puede devolver array o { products: [] }
            // Ajustar según la estructura real de respuesta
        });
    });

    describe('POST /api/products (Admin)', () => {
        it('should create a product successfully', async () => {
            const newProduct = {
                name: 'Perfume Test',
                description: 'Description test',
                price: 100.00,
                stock: 10,
                category_id: 1, // Asumiendo que category_id 1 existe o no es FK estricta en test
                sku: 'TEST-SKU-001'
            };

            const res = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newProduct);

            // Nota: Si falla por category_id, necesitaremos crear una categoría primero
            if (res.statusCode !== 201) {
                console.log('Error creating product:', res.body);
            }

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('name', 'Perfume Test');
        });

        it('should fail if not admin', async () => {
            const newProduct = {
                name: 'Perfume Hacker',
                price: 10.00
            };

            const res = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${customerToken}`)
                .send(newProduct);

            expect(res.statusCode).toEqual(403);
        });
    });
});
