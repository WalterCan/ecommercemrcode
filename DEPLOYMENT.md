# 🚀 Guía de Despliegue (Deployment)

Esta guía detalla los pasos para llevar la **Perfumería E-commerce** a un entorno de producción seguro y eficiente.

---

## 📋 Checklist Pre-Despliegue

### 1. Variables de Entorno
Asegúrate de preparar las variables de entorno de producción para el **Backend**:
- `NODE_ENV=production`
- `DB_HOST`, `DB_USER`, `DB_PASSWORD` (Base de datos prod)
- `JWT_SECRET` (Clave fuerte y única)
- `ALLOWED_ORIGINS` (Dominio del frontend, ej: `https://mitienda.com`)
- `EMAIL_...` (Credenciales SMTP reales)
- `MERCADOPAGO_...` (Credenciales de producción, no sandbox)

### 2. Base de Datos
- Crear instancia de MySQL en producción (AWS RDS, DigitalOcean, local, etc.).
- Asegurar que el usuario de la DB tenga permisos adecuados.

### 3. Frontend Build
- Verificar que `VITE_API_URL` apunte al dominio del backend de producción (ej: `https://api.mitienda.com/api`).

---

## ☁️ Opción 1: Despliegue con VPS (Ubuntu/Debian) + Docker

Esta es la opción recomendada por simplicidad y consistencia.

1. **Preparar el Servidor**
   ```bash
   sudo apt update
   sudo apt install docker.io docker-compose
   ```

2. **Copiar Archivos**
   Sube el proyecto al servidor (git clone o SCP). Asegúrate de **NO** subir `node_modules`.

3. **Configurar Secretos**
   Crea el archivo `.env` en la carpeta `backend` con los valores de producción.

4. **Modificar docker-compose.yml (Opcional)**
   Si vas a usar un proxy inverso externo (como Nginx en el host), ajusta los puertos.

5. **Iniciar Servicios**
   ```bash
   docker-compose up -d --build
   ```

6. **Configurar HTTPS (Nginx + Certbot)**
   Instala Nginx en el servidor y configúralo como proxy inverso hacia los puertos de Docker (Frontend: 5173, Backend: 3000).
   Usa Certbot para SSL gratuito:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d tudominio.com -d api.tudominio.com
   ```

---

## ☁️ Opción 2: Servicios Gestionados (Vercel + Render/Railway)

### Frontend (Vercel/Netlify)
1. Conecta tu repositorio a Vercel.
2. Configura el directorio raíz como `frontend`.
3. Agrega la variable de entorno `VITE_API_URL` en el panel de Vercel.
4. Despliega.

### Backend (Render/Railway/Heroku)
1. Conecta tu repo.
2. Configura el directorio raíz como `backend`.
3. Agrega todas las variables de entorno del backend en el panel del servicio.
4. **Importante:** Estos servicios suelen proveer su propia base de datos o plugins. Configura `DB_HOST` acorde.
5. El comando de inicio debe ser `npm start`.

---

## 🛡️ Post-Despliegue

1. **Verificar Salud:** Accede a `https://api.tudominio.com/api/health`.
2. **Crear Admin:** Ejecuta el script de creación de admin en la consola del servidor/contenedor si es la primera vez.
3. **Logs:** Monitorea los logs para asegurar que no hay errores de conexión.
   ```bash
   docker-compose logs -f backend
   ```
4. **WhatsApp:** Si usas la integración, deberás ver los logs para escanear el QR o persistir la sesión.

---

## ⚠️ Mantenimiento

- **Backups:** Configura backups automáticos de tu base de datos MySQL.
- **Uploads:** Si usas Docker, asegúrate de que la carpeta `/uploads` esté en un volumen persistente (ya configurado en docker-compose) para no perder imágenes al reiniciar contenedores.

---

¡Éxito en tus ventas de perfumes! 🌸
