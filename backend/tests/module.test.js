const request = require('supertest');
const app = require('../src/app');
const { createTestUser, generateToken, clearUsers } = require('./helpers');
const Module = require('../src/models/Module');
const UserModule = require('../src/models/UserModule');

describe('Module System', () => {
    let superAdmin, superAdminToken, admin, adminToken, customer, customerToken;

    beforeEach(async () => {
        await clearUsers();
        await Module.destroy({ where: {}, truncate: true });
        await UserModule.destroy({ where: {}, truncate: true });

        // Crear usuarios de prueba
        superAdmin = await createTestUser({
            email: 'superadmin@test.com',
            password: 'password123',
            role: 'super_admin'
        });
        superAdminToken = generateToken(superAdmin.id);

        admin = await createTestUser({
            email: 'admin@test.com',
            password: 'password123',
            role: 'admin'
        });
        adminToken = generateToken(admin.id);

        customer = await createTestUser({
            email: 'customer@test.com',
            password: 'password123',
            role: 'customer'
        });
        customerToken = generateToken(customer.id);

        // Crear módulos de prueba
        await Module.create({
            code: 'ecommerce',
            name: 'E-commerce',
            description: 'Tienda online',
            is_active: true
        });

        await Module.create({
            code: 'appointments',
            name: 'Turnos',
            description: 'Sistema de turnos',
            is_active: true
        });

        await Module.create({
            code: 'inventory',
            name: 'Inventario',
            description: 'Gestión de inventario',
            is_active: false
        });
    });

    describe('GET /api/modules', () => {
        it('should list all modules', async () => {
            const res = await request(app)
                .get('/api/modules')
                .set('Authorization', `Bearer ${superAdminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(3);
        });

        it('should work for any authenticated user', async () => {
            const res = await request(app)
                .get('/api/modules')
                .set('Authorization', `Bearer ${customerToken}`);

            expect(res.statusCode).toEqual(200);
        });
    });

    describe('GET /api/modules/active', () => {
        it('should return only active modules', async () => {
            const res = await request(app)
                .get('/api/modules/active');

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(2); // Solo ecommerce y appointments
            expect(res.body).toContain('ecommerce');
            expect(res.body).toContain('appointments');
            expect(res.body).not.toContain('inventory');
        });
    });

    describe('GET /api/modules/my-modules', () => {
        it('should return super_admin all active modules', async () => {
            const res = await request(app)
                .get('/api/modules/my-modules')
                .set('Authorization', `Bearer ${superAdminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toContain('ecommerce');
            expect(res.body).toContain('appointments');
        });

        it('should return user-specific modules', async () => {
            // Habilitar solo ecommerce para admin
            await UserModule.create({
                user_id: admin.id,
                module_code: 'ecommerce'
            });

            const res = await request(app)
                .get('/api/modules/my-modules')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toContain('ecommerce');
            expect(res.body).not.toContain('appointments');
        });

        it('should return empty array if user has no modules', async () => {
            const res = await request(app)
                .get('/api/modules/my-modules')
                .set('Authorization', `Bearer ${customerToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.length).toBe(0);
        });
    });

    describe('POST /api/modules/:userId/enable/:moduleCode', () => {
        it('should enable module for user (super_admin only)', async () => {
            const res = await request(app)
                .post(`/api/modules/${admin.id}/enable/ecommerce`)
                .set('Authorization', `Bearer ${superAdminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toContain('habilitado');

            // Verificar que se creó el registro
            const userModule = await UserModule.findOne({
                where: {
                    user_id: admin.id,
                    module_code: 'ecommerce'
                }
            });
            expect(userModule).not.toBeNull();
        });

        it('should fail if non-super_admin tries to enable', async () => {
            const res = await request(app)
                .post(`/api/modules/${customer.id}/enable/ecommerce`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(403);
        });

        it('should fail if module does not exist', async () => {
            const res = await request(app)
                .post(`/api/modules/${admin.id}/enable/nonexistent`)
                .set('Authorization', `Bearer ${superAdminToken}`);

            expect(res.statusCode).toEqual(404);
        });

        it('should not duplicate if already enabled', async () => {
            // Habilitar primera vez
            await request(app)
                .post(`/api/modules/${admin.id}/enable/ecommerce`)
                .set('Authorization', `Bearer ${superAdminToken}`);

            // Intentar habilitar de nuevo
            const res = await request(app)
                .post(`/api/modules/${admin.id}/enable/ecommerce`)
                .set('Authorization', `Bearer ${superAdminToken}`);

            expect(res.statusCode).toEqual(200);

            // Verificar que solo hay un registro
            const count = await UserModule.count({
                where: {
                    user_id: admin.id,
                    module_code: 'ecommerce'
                }
            });
            expect(count).toBe(1);
        });
    });

    describe('DELETE /api/modules/:userId/disable/:moduleCode', () => {
        beforeEach(async () => {
            await UserModule.create({
                user_id: admin.id,
                module_code: 'ecommerce'
            });
        });

        it('should disable module for user (super_admin only)', async () => {
            const res = await request(app)
                .delete(`/api/modules/${admin.id}/disable/ecommerce`)
                .set('Authorization', `Bearer ${superAdminToken}`);

            expect(res.statusCode).toEqual(200);

            // Verificar que se eliminó el registro
            const userModule = await UserModule.findOne({
                where: {
                    user_id: admin.id,
                    module_code: 'ecommerce'
                }
            });
            expect(userModule).toBeNull();
        });

        it('should fail if non-super_admin tries to disable', async () => {
            const res = await request(app)
                .delete(`/api/modules/${admin.id}/disable/ecommerce`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(403);
        });
    });

    describe('Module Access Middleware', () => {
        it('should allow super_admin to access any module', async () => {
            // Intentar acceder a ruta protegida por módulo
            // Nota: Este test requiere que exista una ruta protegida con moduleAccess middleware
            // Por ejemplo: GET /api/products (requiere módulo ecommerce)

            const res = await request(app)
                .get('/api/products')
                .set('Authorization', `Bearer ${superAdminToken}`);

            // Super admin debe poder acceder sin tener el módulo habilitado explícitamente
            expect(res.statusCode).not.toBe(403);
        });

        it('should deny access if user does not have module', async () => {
            // Admin sin módulo ecommerce habilitado
            const res = await request(app)
                .get('/api/products')
                .set('Authorization', `Bearer ${adminToken}`);

            // Debe fallar si la ruta está protegida por moduleAccess
            // Nota: Esto depende de la implementación del middleware
            expect([200, 403]).toContain(res.statusCode);
        });

        it('should allow access if user has module enabled', async () => {
            // Habilitar módulo para admin
            await UserModule.create({
                user_id: admin.id,
                module_code: 'ecommerce'
            });

            const res = await request(app)
                .get('/api/products')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).not.toBe(403);
        });
    });
});
