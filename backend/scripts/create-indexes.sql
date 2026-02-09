-- Script para crear índices en la base de datos
-- Ejecutar después de las migraciones para mejorar performance
-- Nota: Si el índice ya existe, se mostrará un warning pero continuará

USE ecommercemrcode;

-- ============================================
-- ÍNDICES PARA TABLA PRODUCTS
-- ============================================

-- Índice para búsquedas por categoría
CREATE INDEX idx_products_category_id ON products(category_id);

-- Índice para productos destacados
CREATE INDEX idx_products_featured ON products(featured);

-- Índice para búsquedas por nombre
CREATE INDEX idx_products_name ON products(name);

-- Índice compuesto para filtros comunes
CREATE INDEX idx_products_category_featured ON products(category_id, featured);

-- Índice para stock
CREATE INDEX idx_products_stock ON products(stock);

-- ============================================
-- ÍNDICES PARA TABLA ORDERS
-- ============================================

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_orders_created_at ON orders(createdAt);

-- ============================================
-- ÍNDICES PARA TABLA ORDER_ITEMS
-- ============================================

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- ============================================
-- ÍNDICES PARA TABLA REVIEWS
-- ============================================

CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_product_rating ON reviews(product_id, rating);

-- ============================================
-- ÍNDICES PARA TABLA COUPONS
-- ============================================

CREATE INDEX idx_coupons_active ON coupons(active);
CREATE INDEX idx_coupons_valid_until ON coupons(valid_until);

-- ============================================
-- ÍNDICES PARA TABLA PATIENTS
-- ============================================

CREATE INDEX idx_patients_dni ON patients(dni);
CREATE INDEX idx_patients_email ON patients(email);
CREATE INDEX idx_patients_phone ON patients(phone);

-- ============================================
-- ÍNDICES PARA TABLA APPOINTMENTS
-- ============================================

CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_therapy_id ON appointments(therapy_id);
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_date_status ON appointments(date, status);

-- ============================================
-- ÍNDICES PARA TABLA PURCHASES
-- ============================================

CREATE INDEX idx_purchases_supplier_id ON purchases(supplier_id);
CREATE INDEX idx_purchases_purchase_date ON purchases(purchase_date);
CREATE INDEX idx_purchases_status ON purchases(status);

-- ============================================
-- ÍNDICES PARA TABLA SUPPLIERS
-- ============================================

CREATE INDEX idx_suppliers_name ON suppliers(name);
CREATE INDEX idx_suppliers_active ON suppliers(active);

-- ============================================
-- ÍNDICES PARA TABLA CATEGORIES
-- ============================================

CREATE INDEX idx_categories_name ON categories(name);

-- ============================================
-- ÍNDICES PARA TABLA PRODUCT_IMAGES
-- ============================================

CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_images_is_main ON product_images(is_main);

-- ============================================
-- ÍNDICES PARA TABLA PRODUCT_VARIANTS
-- ============================================

CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
