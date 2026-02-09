const request = require('supertest');
const app = require('../src/app');
const { createTestUser, generateToken, clearUsers } = require('./helpers');
const Coupon = require('../src/models/Coupon');

describe('Coupon Endpoints', () => {
    let adminUser, adminToken, customerUser, customerToken;

    beforeEach(async () => {
        await clearUsers();
        await Coupon.destroy({ where: {}, truncate: true });

        adminUser = await createTestUser({
            email: 'admin@test.com',
            password: 'password123',
            role: 'admin'
        });
        adminToken = generateToken(adminUser.id);

        customerUser = await createTestUser({
            email: 'customer@test.com',
            password: 'password123',
            role: 'customer'
        });
        customerToken = generateToken(customerUser.id);
    });

    describe('POST /api/coupons', () => {
        it('should create coupon with valid data (admin only)', async () => {
            const res = await request(app)
                .post('/api/coupons')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    code: 'SUMMER20',
                    discount_type: 'percentage',
                    discount_value: 20,
                    is_active: true,
                    valid_from: new Date(),
                    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('id');
            expect(res.body.code).toBe('SUMMER20');
            expect(res.body.discount_value).toBe(20);
        });

        it('should fail if customer tries to create coupon', async () => {
            const res = await request(app)
                .post('/api/coupons')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    code: 'SUMMER20',
                    discount_type: 'percentage',
                    discount_value: 20,
                    is_active: true,
                    valid_from: new Date(),
                    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                });

            expect(res.statusCode).toEqual(403);
        });

        it('should fail with duplicate code', async () => {
            await Coupon.create({
                code: 'DUPLICATE',
                discount_type: 'percentage',
                discount_value: 10,
                is_active: true,
                valid_from: new Date(),
                valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });

            const res = await request(app)
                .post('/api/coupons')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    code: 'DUPLICATE',
                    discount_type: 'percentage',
                    discount_value: 15,
                    is_active: true,
                    valid_from: new Date(),
                    valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                });

            expect(res.statusCode).toEqual(400);
        });
    });

    describe('POST /api/coupons/validate', () => {
        it('should validate active coupon within date range', async () => {
            await Coupon.create({
                code: 'VALID10',
                discount_type: 'percentage',
                discount_value: 10,
                is_active: true,
                valid_from: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Ayer
                valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // En 7 días
            });

            const res = await request(app)
                .post('/api/coupons/validate')
                .send({
                    code: 'VALID10',
                    order_total: 100
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.valid).toBe(true);
            expect(res.body.discount).toBe(10); // 10% de 100
        });

        it('should fail with expired coupon', async () => {
            await Coupon.create({
                code: 'EXPIRED',
                discount_type: 'percentage',
                discount_value: 10,
                is_active: true,
                valid_from: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
                valid_until: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // Ayer
            });

            const res = await request(app)
                .post('/api/coupons/validate')
                .send({
                    code: 'EXPIRED',
                    order_total: 100
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body.valid).toBe(false);
            expect(res.body.message).toContain('expirado');
        });

        it('should fail with inactive coupon', async () => {
            await Coupon.create({
                code: 'INACTIVE',
                discount_type: 'percentage',
                discount_value: 10,
                is_active: false,
                valid_from: new Date(),
                valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });

            const res = await request(app)
                .post('/api/coupons/validate')
                .send({
                    code: 'INACTIVE',
                    order_total: 100
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body.valid).toBe(false);
        });

        it('should fail with max uses reached', async () => {
            await Coupon.create({
                code: 'MAXED',
                discount_type: 'percentage',
                discount_value: 10,
                is_active: true,
                valid_from: new Date(),
                valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                max_uses: 5,
                current_uses: 5
            });

            const res = await request(app)
                .post('/api/coupons/validate')
                .send({
                    code: 'MAXED',
                    order_total: 100
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body.valid).toBe(false);
            expect(res.body.message).toContain('límite');
        });

        it('should calculate percentage discount correctly', async () => {
            await Coupon.create({
                code: 'PERCENT15',
                discount_type: 'percentage',
                discount_value: 15,
                is_active: true,
                valid_from: new Date(),
                valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });

            const res = await request(app)
                .post('/api/coupons/validate')
                .send({
                    code: 'PERCENT15',
                    order_total: 200
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.discount).toBe(30); // 15% de 200
        });

        it('should calculate fixed amount discount correctly', async () => {
            await Coupon.create({
                code: 'FIXED50',
                discount_type: 'fixed',
                discount_value: 50,
                is_active: true,
                valid_from: new Date(),
                valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });

            const res = await request(app)
                .post('/api/coupons/validate')
                .send({
                    code: 'FIXED50',
                    order_total: 200
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.discount).toBe(50);
        });

        it('should fail if order total below minimum', async () => {
            await Coupon.create({
                code: 'MIN100',
                discount_type: 'percentage',
                discount_value: 10,
                is_active: true,
                valid_from: new Date(),
                valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                min_purchase_amount: 100
            });

            const res = await request(app)
                .post('/api/coupons/validate')
                .send({
                    code: 'MIN100',
                    order_total: 50
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body.valid).toBe(false);
            expect(res.body.message).toContain('mínimo');
        });

        it('should not allow discount greater than order total', async () => {
            await Coupon.create({
                code: 'FIXED200',
                discount_type: 'fixed',
                discount_value: 200,
                is_active: true,
                valid_from: new Date(),
                valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });

            const res = await request(app)
                .post('/api/coupons/validate')
                .send({
                    code: 'FIXED200',
                    order_total: 100
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.discount).toBeLessThanOrEqual(100);
        });
    });

    describe('GET /api/coupons', () => {
        it('should list all coupons (admin only)', async () => {
            await Coupon.create({
                code: 'TEST1',
                discount_type: 'percentage',
                discount_value: 10,
                is_active: true,
                valid_from: new Date(),
                valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });

            await Coupon.create({
                code: 'TEST2',
                discount_type: 'fixed',
                discount_value: 50,
                is_active: true,
                valid_from: new Date(),
                valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });

            const res = await request(app)
                .get('/api/coupons')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(2);
        });

        it('should fail for non-admin users', async () => {
            const res = await request(app)
                .get('/api/coupons')
                .set('Authorization', `Bearer ${customerToken}`);

            expect(res.statusCode).toEqual(403);
        });
    });

    describe('PATCH /api/coupons/:id', () => {
        let coupon;

        beforeEach(async () => {
            coupon = await Coupon.create({
                code: 'UPDATEME',
                discount_type: 'percentage',
                discount_value: 10,
                is_active: true,
                valid_from: new Date(),
                valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });
        });

        it('should update coupon (admin only)', async () => {
            const res = await request(app)
                .patch(`/api/coupons/${coupon.id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    discount_value: 15,
                    is_active: false
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.discount_value).toBe(15);
            expect(res.body.is_active).toBe(false);
        });

        it('should fail for non-admin users', async () => {
            const res = await request(app)
                .patch(`/api/coupons/${coupon.id}`)
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    discount_value: 15
                });

            expect(res.statusCode).toEqual(403);
        });
    });

    describe('DELETE /api/coupons/:id', () => {
        let coupon;

        beforeEach(async () => {
            coupon = await Coupon.create({
                code: 'DELETEME',
                discount_type: 'percentage',
                discount_value: 10,
                is_active: true,
                valid_from: new Date(),
                valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });
        });

        it('should delete coupon (admin only)', async () => {
            const res = await request(app)
                .delete(`/api/coupons/${coupon.id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);

            const deletedCoupon = await Coupon.findByPk(coupon.id);
            expect(deletedCoupon).toBeNull();
        });

        it('should fail for non-admin users', async () => {
            const res = await request(app)
                .delete(`/api/coupons/${coupon.id}`)
                .set('Authorization', `Bearer ${customerToken}`);

            expect(res.statusCode).toEqual(403);
        });
    });
});
