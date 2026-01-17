#!/bin/bash

# ============================================
# Script de Inicialización - Perfumería E-commerce
# ============================================

echo "🌸 Iniciando configuración de Perfumería E-commerce..."
echo ""

# Verificar si MySQL está corriendo
echo "📊 Verificando MySQL..."
mysql --version > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ MySQL encontrado"
else
    echo "❌ MySQL no encontrado. Por favor instala MySQL primero."
    exit 1
fi

# Crear base de datos
echo ""
echo "🗄️ Creando base de datos ecommercemrcode..."
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS ecommercemrcode CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

if [ $? -eq 0 ]; then
    echo "✅ Base de datos creada exitosamente"
else
    echo "❌ Error al crear la base de datos"
    exit 1
fi

# Instalar dependencias del backend
echo ""
echo "📦 Instalando dependencias del backend..."
cd backend
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencias del backend instaladas"
else
    echo "❌ Error al instalar dependencias del backend"
    exit 1
fi

# Instalar dependencias del frontend
echo ""
echo "📦 Instalando dependencias del frontend..."
cd ../frontend
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencias del frontend instaladas"
else
    echo "❌ Error al instalar dependencias del frontend"
    exit 1
fi

cd ..

echo ""
echo "✨ ¡Configuración completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Configurar credenciales en backend/.env (Mercado Pago, Email)"
echo "2. Iniciar backend: cd backend && npm run dev"
echo "3. Iniciar frontend: cd frontend && npm run dev"
echo "4. Crear usuario admin: node backend/create_admin_safe.js"
echo ""
echo "🌸 ¡Éxito con tu perfumería!"
