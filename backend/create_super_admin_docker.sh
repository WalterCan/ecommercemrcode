#!/bin/bash
# Script para crear Super Admin ejecutando el comando dentro del contenedor Docker

echo "🚀 Creando Super Admin dentro del contenedor Docker..."
docker exec ecommerce-perfumes-api node create_super_admin.js
