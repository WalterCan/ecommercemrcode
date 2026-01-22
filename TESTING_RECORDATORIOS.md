# Testing de Recordatorios - Comandos Manuales

## 🔍 Diagnóstico

### 1. Verificar que el servidor esté corriendo
```bash
curl http://localhost:3002/api/health
```

**Resultado esperado:** `{"status":"ok",...}`

---

### 2. Login y obtener token

**En la aplicación web:**
1. Ve a http://localhost:5176
2. Login como admin: `admin@ecommerce.com` / `admin123`
3. Abre la consola del navegador (F12)
4. Ejecuta: `localStorage.getItem('token')`
5. Copia el token

---

### 3. Verificar turnos en base de datos

```bash
docker exec -it ecommerce-perfumes-db mysql -u root -proot_password -D ecommercemrcode -e "SELECT id, date, time, end_time, status, reminder_24h_sent, reminder_1h_sent, created_at FROM appointments WHERE status='scheduled' ORDER BY date DESC LIMIT 5;"
```

**Buscar:**
- ✅ Turnos con `status='scheduled'`
- ✅ `reminder_24h_sent=0` (no enviado)
- ✅ Fecha para mañana

---

### 4. Enviar recordatorios manualmente

**Reemplaza `TU_TOKEN_AQUI` con el token obtenido en el paso 2:**

```bash
curl -X POST http://localhost:3002/api/reminders/send \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

**Resultado esperado:**
```json
{
  "success": true,
  "message": "Recordatorios enviados",
  "results": {
    "timestamp": "2026-01-21T...",
    "reminders_24h": { "sent": 1, "errors": 0 },
    "reminders_1h": { "sent": 0, "errors": 0 },
    "total_sent": 1,
    "total_errors": 0
  }
}
```

---

### 5. Verificar logs del backend

```bash
docker logs ecommerce-perfumes-api --tail 100
```

**Buscar:**
- `✅ Email 24h enviado a ...`
- `✅ WhatsApp 24h enviado a ...`
- `✅ Recordatorio 24h enviado para turno #X`

---

## 🐛 Problemas Comunes

### Problema 1: "Could not connect to server"
**Causa:** Usando puerto incorrecto  
**Solución:** Usar puerto **3002** en lugar de 3000

### Problema 2: "0 turnos encontrados"
**Causas posibles:**
1. El turno no está en el rango de 23-25 horas
2. `reminder_24h_sent` ya está en `true`
3. El turno no tiene `status='scheduled'`

**Solución:** Verificar con el comando del paso 3

### Problema 3: "Recordatorio enviado pero no llegó"
**Causas posibles:**
1. Email no configurado correctamente
2. WhatsApp no conectado
3. Usuario sin email/teléfono

**Solución:** Verificar logs y configuración de email/WhatsApp

---

## ✅ Verificación Final

### Verificar que el recordatorio se marcó como enviado:

```bash
docker exec -it ecommerce-perfumes-db mysql -u root -proot_password -D ecommercemrcode -e "SELECT id, reminder_24h_sent, reminder_24h_sent_at FROM appointments WHERE id=TU_ID_DE_TURNO;"
```

Debería mostrar:
- `reminder_24h_sent = 1`
- `reminder_24h_sent_at = 2026-01-21 21:XX:XX`

---

## 🔧 Ajustar Ventana de Tiempo (Para Testing)

Si quieres probar con un turno que no está exactamente en 24h, puedes modificar temporalmente el servicio:

**Archivo:** `backend/src/services/reminderService.js`

**Línea 25-26:** Cambiar de:
```javascript
const in24Hours = addHours(now, 24);
const in23Hours = addHours(now, 23);
```

A (para testing):
```javascript
const in24Hours = addHours(now, 48); // Buscar hasta 48h
const in23Hours = addHours(now, 0);  // Desde ahora
```

Luego reinicia: `docker-compose restart backend`

---

## 📧 Configuración de Email

Verifica que tengas configurado el email en Settings o `.env`:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-contraseña-app
```

**Nota:** Para Gmail necesitas una "Contraseña de Aplicación", no tu contraseña normal.
