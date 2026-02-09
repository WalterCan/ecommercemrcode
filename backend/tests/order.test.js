const request = require('supertest');
const app = require('../src/app');
const { createTestUser, generateToken, clearUsers } = require('./helpers');
const Product = require('../src/models/Product');
const Order = require('../src/models/Order');
const Coupon = require('../src/models/Coupon');
const Category = require('../src/models/Category');

describe('Order Endpoints', () => {
    let user, adminUser, token, adminToken, product, category;

    beforeEach(async () => {
        // Limpiar datos
        await clearUsers();
        await Order.destroy({ where: {}, truncate: true });
        await Product.destroy({ where: {}, truncate: true });
        await Category.destroy({ where: {}, truncate: true });
        await Coupon.destroy({ where: {}, truncate: true });

        // Crear usuarios de prueba
        user = await createTestUser({
            email: 'customer@test.com',
            password: 'password123',
            role: 'customer'
        });
        token = generateToken(user.id);

        adminUser = await createTestUser({
            email: 'admin@test.com',
            password: 'password123',
            role: 'admin'
        });
        adminToken = generateToken(adminUser.id);

        // Crear categoría y producto de prueba
        category = await Category.create({
            name: 'Test Category',
            description: 'Test description'
        });

        product = await Product.create({
            name: 'Test Product',
            description: 'Test description',
            price: 100,
            stock: 10,
            category_id: category.id,
            is_active: true
        });
    });

    describe('POST /api/orders', () => {
        it('should create order with valid products', async () => {
            const res = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    items: [
                        { product_id: product.id, quantity: 2, price: 100 }
                    ],
                    total: 200,
                    shipping_address: 'Test Address 123',
                    payment_method: 'cash'
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('id');
            expect(res.body.total).toBe(200);
            expect(res.body.status).toBe('pending');

            // Verificar que se decrementó el stock
            const updatedProduct = await Product.findByPk(product.id);
            expect(updatedProduct.stock).toBe(8); // 10 - 2
        });

        it('should fail with insufficient stock', async () => {
            const res = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    items: [
                        { product_id: product.id, quantity: 15, price: 100 } // Más del stock disponible
                    ],
                    total: 1500,
                    shipping_address: 'Test Address 123',
                    payment_method: 'cash'
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message');
            expect(res.body.message).toContain('stock');

            // Verificar que NO se decrementó el stock
            const updatedProduct = await Product.findByPk(product.id);
            expect(updatedProduct.stock).toBe(10);
        });

        it('should fail without authentication', async () => {
            const res = await request(app)
                .post('/api/orders')
                .send({
                    items: [
                        { product_id: product.id, quantity: 2, price: 100 }
                    ],
                    total: 200,
                    shipping_address: 'Test Address 123',
                    payment_method: 'cash'
                });

            expect(res.statusCode).toEqual(401);
        });

        it('should apply valid coupon discount', async () => {
            // Crear cupón de descuento
            const coupon = await Coupon.create({
                code: 'TEST10',
                discount_type: 'percentage',
                discount_value: 10,
                is_active: true,
                valid_from: new Date(),
                valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
            });

            const res = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    items: [
                        { product_id: product.id, quantity: 2, price: 100 }
                    ],
                    subtotal: 200,
                    coupon_code: 'TEST10',
                    discount: 20, // 10% de 200
                    total: 180,
                    shipping_address: 'Test Address 123',
                    payment_method: 'cash'
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body.discount).toBe(20);
            expect(res.body.total).toBe(180);
            expect(res.body.coupon_code).toBe('TEST10');
        });

        it('should fail with expired coupon', async () => {
            // Crear cupón expirado
            await Coupon.create({
                code: 'EXPIRED',
                discount_type: 'percentage',
                discount_value: 10,
                is_active: true,
                valid_from: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // Hace 14 días
                valid_until: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Hace 7 días
            });

            const res = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    items: [
                        { product_id: product.id, quantity: 2, price: 100 }
                    ],
                    subtotal: 200,
                    coupon_code: 'EXPIRED',
                    discount: 20,
                    total: 180,
                    shipping_address: 'Test Address 123',
                    payment_method: 'cash'
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toContain('cupón');
        });
    });

    describe('PATCH /api/orders/:id/status', () => {
        let order;

        beforeEach(async () => {
            // Crear orden de prueba
            order = await Order.create({
                user_id: user.id,
                total: 200,
                status: 'pending',
                shipping_address: 'Test Address 123',
                payment_method: 'cash'
            });

            // Decrementar stock manualmente para simular orden creada
            await product.update({ stock: 8 }); // 10 - 2
        });

        it('should cancel order and restore stock', async () => {
            // Primero necesitamos asociar items a la orden
            await Order.update(
                { items: JSON.stringify([{ product_id: product.id, quantity: 2 }]) },
                { where: { id: order.id } }
            );

            const res = await request(app)
                .patch(`/api/orders/${order.id}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'cancelled' });

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toBe('cancelled');

            // Verificar que se restauró el stock
            const updatedProduct = await Product.findByPk(product.id);
            expect(updatedProduct.stock).toBe(10); // 8 + 2
        });

        it('should fail to reactivate cancelled order without stock', async () => {
            // Cancelar orden primero
            await order.update({ status: 'cancelled' });

            // Agotar el stock
            await product.update({ stock: 0 });

            const res = await request(app)
                .patch(`/api/orders/${order.id}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'pending' });

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toContain('stock');
        });

        it('should only allow admin to change status', async () => {
            const res = await request(app)
                .patch(`/api/orders/${order.id}/status`)
                .set('Authorization', `Bearer ${token}`) // Usuario normal
                .send({ status: 'shipped' });

            expect(res.statusCode).toEqual(403);
        });
    });

    describe('DELETE /api/orders/:id', () => {
        let order;

        beforeEach(async () => {
            order = await Order.create({
                user_id: user.id,
                total: 200,
                status: 'pending',
                shipping_address: 'Test Address 123',
                payment_method: 'cash',
                items: JSON.stringify([{ product_id: product.id, quantity: 2 }])
            });

            await product.update({ stock: 8 });
        });

        it('should delete order and restore stock if not cancelled', async () => {
            const res = await request(app)
                .delete(`/api/orders/${order.id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);

            // Verificar que se restauró el stock
            const updatedProduct = await Product.findByPk(product.id);
            expect(updatedProduct.stock).toBe(10);

            // Verificar que la orden fue eliminada
            const deletedOrder = await Order.findByPk(order.id);
            expect(deletedOrder).toBeNull();
        });

        it('should not restore stock if order was already cancelled', async () => {
            await order.update({ status: 'cancelled' });
            await product.update({ stock: 10 }); // Ya restaurado

            const res = await request(app)
                .delete(`/api/orders/${order.id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);

            // Stock debe permanecer igual
            const updatedProduct = await Product.findByPk(product.id);
            expect(updatedProduct.stock).toBe(10);
        });
    });

    describe('GET /api/orders', () => {
        it('should return user orders', async () => {
            await Order.create({
                user_id: user.id,
                total: 200,
                status: 'pending',
                shipping_address: 'Test Address 123',
                payment_method: 'cash'
            });

            const res = await request(app)
                .get('/api/orders')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
        });

        it('should not return other users orders', async () => {
            const otherUser = await createTestUser({
                email: 'other@test.com',
                password: 'password123'
            });

            await Order.create({
                user_id: otherUser.id,
                total: 300,
                status: 'pending',
                shipping_address: 'Other Address',
                payment_method: 'cash'
            });

            const res = await request(app)
                .get('/api/orders')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.length).toBe(0);
        });
    });
});
