-- Script simplificado para crear índices en tablas principales
-- Solo incluye tablas que existen y columnas verificadas

USE ecommercemrcode;

-- PRODUCTS
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_stock ON products(stock);

-- ORDERS (verificar columnas primero)
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_created_at ON orders(createdAt);

-- ORDER_ITEMS
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- REVIEWS
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);

-- COUPONS
CREATE INDEX idx_coupons_active ON coupons(active);

-- CATEGORIES
CREATE INDEX idx_categories_name ON categories(name);

-- PRODUCT_IMAGES
CREATE INDEX idx_product_images_product_id ON product_images(product_id);

-- PRODUCT_VARIANTS
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);

-- PATIENTS (si existe)
CREATE INDEX idx_patients_dni ON patients(dni);
CREATE INDEX idx_patients_email ON patients(email);

-- SUPPLIERS (si existe)
CREATE INDEX idx_suppliers_name ON suppliers(name);
