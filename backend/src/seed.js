const sequelize = require('./config/db');
const Category = require('./models/Category');
const Product = require('./models/Product');
const User = require('./models/User');

/**
 * Script de Semilla (Seeder)
 * Pobla la base de datos con categorías y productos iniciales.
 */
const seedDatabase = async () => {
    try {
        await sequelize.sync({ force: true }); // CUIDADO: fuerza la recreación de tablas
        console.log('🌱 Iniciando sembrado de datos...');

        // // Crear usuario administrador
        // await User.create({
        //     email: 'admin@tiendaholistica.com',
        //     password: 'admin_password_2025' // Se encriptará automáticamente por el hook
        // });

        // 1. Crear Categorías
        const categories = await Category.bulkCreate([
            { name: 'Aceites Esenciales', description: 'Extractos naturales para aromaterapia y bienestar.' },
            { name: 'Cristales y Piedras', description: 'Gemas naturales con propiedades energéticas específicas.' },
            { name: 'Inciensos y Sahumerios', description: 'Elementos para la limpieza energética de espacios.' }
        ]);

        console.log('✅ Categorías creadas.');

        // // 2. Crear Productos
        // await Product.bulkCreate([
        //     {
        //         name: 'Aceite de Lavanda Pureza',
        //         description: 'Aceite esencial 100% puro para relajación profunda y sueño reparador.',
        //         price: 1500.00,
        //         image_url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800',
        //         stock: 25,
        //         featured: true,
        //         category_id: categories[0].id
        //     },
        //     {
        //         name: 'Cuarzo Rosa del Amor',
        //         description: 'Piedra del amor incondicional y la paz infinita. Ideal para el chakra del corazón.',
        //         price: 2200.00,
        //         image_url: 'https://images.unsplash.com/photo-1614964157168-0c4d0d7df7c8?auto=format&fit=crop&q=80&w=800',
        //         stock: 15,
        //         featured: true,
        //         category_id: categories[1].id
        //     },
        //     {
        //         name: 'Sahumerio de Palo Santo',
        //         description: 'Madera sagrada recolectada de forma sostenible para limpieza y purificación.',
        //         price: 850.00,
        //         image_url: 'https://images.unsplash.com/photo-1599790112016-0fd35b1e6a5c?auto=format&fit=crop&q=80&w=800',
        //         stock: 50,
        //         featured: false,
        //         category_id: categories[2].id
        //     },
        //     {
        //         name: 'Amatista en Bruto',
        //         description: 'Potente piedra de protección y transmutación de energía negativa en positiva.',
        //         price: 2800.00,
        //         image_url: 'https://images.unsplash.com/photo-1615791110862-6f5bb7afc6dd?auto=format&fit=crop&q=80&w=800',
        //         stock: 10,
        //         featured: true,
        //         category_id: categories[1].id
        //     }
        // ]);

        console.log('✅ Productos creados.');
        console.log('✨ Base de datos sembrada con éxito.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error al sembrar la base de datos:', error);
        process.exit(1);
    }
};

seedDatabase();
