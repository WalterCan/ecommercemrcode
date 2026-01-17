-- ============================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS
-- Perfumería E-commerce
-- ============================================

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS ecommercemrcode 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE ecommercemrcode;

-- Mostrar mensaje de confirmación
SELECT 'Base de datos ecommercemrcode creada exitosamente!' AS mensaje;

-- Mostrar información de la base de datos
SHOW DATABASES LIKE 'ecommercemrcode';
