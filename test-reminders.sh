#!/bin/bash

# Script de testing para recordatorios
# Uso: ./test-reminders.sh

echo "🧪 Testing Sistema de Recordatorios"
echo "===================================="
echo ""

# 1. Verificar que el servidor esté corriendo
echo "1️⃣ Verificando servidor..."
if curl -s http://localhost:3002/api/health > /dev/null; then
    echo "✅ Servidor corriendo en puerto 3002"
else
    echo "❌ Servidor no responde en puerto 3002"
    exit 1
fi

echo ""

# 2. Login como admin para obtener token
echo "2️⃣ Obteniendo token de admin..."
TOKEN=$(curl -s -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ecommerce.com","password":"admin123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ No se pudo obtener token. Verifica credenciales de admin."
    exit 1
fi

echo "✅ Token obtenido: ${TOKEN:0:20}..."
echo ""

# 3. Verificar turnos programados
echo "3️⃣ Verificando turnos programados..."
curl -s http://localhost:3002/api/appointments \
  -H "Authorization: Bearer $TOKEN" \
  | grep -o '"status":"scheduled"' | wc -l | xargs echo "Turnos programados:"

echo ""

# 4. Enviar recordatorios manualmente
echo "4️⃣ Enviando recordatorios..."
RESULT=$(curl -s -X POST http://localhost:3002/api/reminders/send \
  -H "Authorization: Bearer $TOKEN")

echo "$RESULT" | python3 -m json.tool 2>/dev/null || echo "$RESULT"

echo ""
echo "✅ Test completado"
