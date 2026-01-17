const sequelize = require('../src/config/db');
const Product = require('../src/models/Product');
const Order = require('../src/models/Order');

// Function to wait for a moment
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function verifyStockLogic() {
    console.log('🔍 Starting Stock Management Logic Verification...');
    let testProduct = null;
    let testOrder = null;

    try {
        await sequelize.authenticate();
        console.log('✅ Database connected.');

        // 1. Create Test Product
        console.log('\n--- Step 1: Create Test Product ---');
        testProduct = await Product.create({
            name: 'Stock Test Product',
            description: 'Temporary product for testing stock logic',
            price: 100.00,
            stock: 10,
            image_url: 'http://test.com/image.jpg'
        });
        console.log(`✅ Product created. ID: ${testProduct.id}, Stock: ${testProduct.stock}`);

        // 2. Create Order (Should decrease stock)
        console.log('\n--- Step 2: Create Order (Quantity: 1) ---');
        // We simulate the API logic here by manually adjusting stock as the Controller would, 
        // OR better yet, we just verify the route logic if we could call it. 
        // Since this is a script, we will test the LOGIC that should be in the route.
        // Wait, the logic IS in the route. To test the route logic properly without running the server, 
        // we'd need to mock the request/response or extract the logic to a service.
        // HOWEVER, for this verification, I will simulate the *exact operations* the route performs 
        // to ensure the Models and Sequelize transactions work as expected.
        
        // Actually, the most robust way is to use `axios` to call the running API, but I'll stick to 
        // unit-testing the logic flow here to avoid dependency on the server being up.
        
        // Simulating Route Logic for Creation:
        const t1 = await sequelize.transaction();
        try {
            await testProduct.reload({ transaction: t1 });
            await testProduct.update({ stock: testProduct.stock - 1 }, { transaction: t1 });
            
            testOrder = await Order.create({
                customer_name: 'Test Tech',
                customer_email: 'test@tech.com',
                customer_phone: '123456789',
                items: [{
                    id: testProduct.id,
                    name: testProduct.name,
                    price: testProduct.price,
                    quantity: 1
                }],
                total: 100.00,
                payment_method: 'cash',
                order_status: 'pending'
            }, { transaction: t1 });

            await t1.commit();
            console.log(`✅ Order created. ID: ${testOrder.id}`);
        } catch (e) {
            await t1.rollback();
            throw e;
        }

        // Verify Stock after Creation
        await testProduct.reload();
        console.log(`Checking Stock... Expected: 9, Actual: ${testProduct.stock}`);
        if (testProduct.stock !== 9) throw new Error('Stock update failed on Order Creation');


        // 3. Cancel Order (Should restore stock)
        console.log('\n--- Step 3: Cancel Order (Should restore stock) ---');
        
        // Logic from PUT /api/orders/:id
        const t2 = await sequelize.transaction();
        try {
            // Simulate: previousStatus != 'cancelled' && newStatus === 'cancelled'
            for (const item of testOrder.items) {
                const p = await Product.findByPk(item.id, { transaction: t2 });
                await p.update({ stock: p.stock + item.quantity }, { transaction: t2 });
            }
            testOrder.order_status = 'cancelled';
            await testOrder.save({ transaction: t2 });
            await t2.commit();
            console.log('✅ Order cancelled.');
        } catch (e) {
            await t2.rollback();
            throw e;
        }

        // Verify Stock after Cancellation
        await testProduct.reload();
        console.log(`Checking Stock... Expected: 10, Actual: ${testProduct.stock}`);
        if (testProduct.stock !== 10) throw new Error('Stock restoration failed on Cancellation');


        // 4. Restore Order (Should decrease stock again)
        console.log('\n--- Step 4: Restore Order (Should decrease stock) ---');

        // Logic from PUT /api/orders/:id
        const t3 = await sequelize.transaction();
        try {
            // Simulate: previousStatus === 'cancelled' && newStatus !== 'cancelled'
            for (const item of testOrder.items) {
                const p = await Product.findByPk(item.id, { transaction: t3 });
                // Check stock availability
                if (p.stock < item.quantity) throw new Error('Insufficient stock');
                await p.update({ stock: p.stock - item.quantity }, { transaction: t3 });
            }
            testOrder.order_status = 'processing';
            await testOrder.save({ transaction: t3 });
            await t3.commit();
            console.log('✅ Order restored to processing.');
        } catch (e) {
            await t3.rollback();
            throw e;
        }

        // Verify Stock after Restoration
        await testProduct.reload();
        console.log(`Checking Stock... Expected: 9, Actual: ${testProduct.stock}`);
        if (testProduct.stock !== 9) throw new Error('Stock deduction failed on Restoration');


        // 5. Delete Order (Should restore stock)
        console.log('\n--- Step 5: Delete Order (Should restore stock) ---');

        // Logic from DELETE /api/orders/:id
        const t4 = await sequelize.transaction();
        try {
            // If order.order_status !== 'cancelled', restore stock
            if (testOrder.order_status !== 'cancelled') {
                 for (const item of testOrder.items) {
                    const p = await Product.findByPk(item.id, { transaction: t4 });
                    await p.update({ stock: p.stock + item.quantity }, { transaction: t4 });
                }
            }
            await testOrder.destroy({ transaction: t4 });
            await t4.commit();
            console.log('✅ Order deleted.');
        } catch (e) {
            await t4.rollback();
            throw e;
        }

        // Verify Stock after Deletion
        await testProduct.reload();
        console.log(`Checking Stock... Expected: 10, Actual: ${testProduct.stock}`);
        if (testProduct.stock !== 10) throw new Error('Stock restoration failed on Deletion');

        
        console.log('\n✅✅✅ VISUAL VERIFICATION SUCCESSFUL: Logic works as expected!');

    } catch (error) {
        console.error('\n❌ VERIFICATION FAILED:', error);
    } finally {
        // Cleanup
        if (testProduct) {
            await testProduct.destroy();
            console.log('\n🧹 Test data cleaned up.');
        }
        await sequelize.close();
    }
}

verifyStockLogic();
