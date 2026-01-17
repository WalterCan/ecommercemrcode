# 🌸 Perfumería E-commerce

> Una plataforma de comercio electrónico elegante para la venta de perfumes y fragancias.

## 📋 Descripción

Este proyecto es una tienda virtual completa ("Full Stack") desarrollada para vender perfumes, fragancias y productos de perfumería. Incluye un catálogo de productos, carrito de compras, gestión de usuarios, checkout integrado con Mercado Pago, y un panel de administración completo.

## 🚀 Tecnologías

### Frontend
- **React 19**: Biblioteca de UI moderna.
- **Vite**: Build tool rápido y ligero.
- **Tailwind CSS**: Framework de estilos utility-first.
- **React Router Dom**: Gestión de rutas.
- **Context API**: Gestión de estado global (Carrito, Auth).

### Backend
- **Node.js + Express**: Servidor web robusto.
- **MySQL + Sequelize**: Base de datos relacional y ORM.
- **JWT**: Autenticación segura.
- **Mercado Pago SDK**: Pasarela de pagos.
- **Nodemailer**: Sistema de notificaciones por email.
- **WhatsApp Web.js**: Notificaciones automáticas por WhatsApp.

---

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js (v18 o superior)
- MySQL Server
- Git

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd ecommerce
```

### 2. Configurar Backend
```bash
cd backend
npm install
```

Crea un archivo `.env` basado en `.env.example` y configura tus credenciales de base de datos, email y Mercado Pago.

### 3. Configurar Frontend
```bash
cd ../frontend
npm install
```
Crea un archivo `.env` con la URL de tu API:
```env
VITE_API_URL=http://localhost:3000/api
```

### 4. Base de Datos
Asegúrate de tener un servidor MySQL corriendo. El backend creará automáticamente las tablas al iniciar si están configuradas correctamente las credenciales en el `.env`.

---

## ▶️ Ejecución

### Desarrollo (Local)

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### Producción (Docker)
El proyecto incluye configuración Docker Compose para levantar todo el stack fácilmente:
```bash
docker-compose up --build
```

---

## 📱 Funcionalidades Principales

### Para Clientes
- 🔍 Explorar productos por categorías.
- 🛒 Carrito de compras persistente.
- 💳 Pagos seguros con Mercado Pago, Transferencia o Efectivo.
- 👤 Perfil de usuario con historial de pedidos.
- 📧 Recuperación de contraseña y confirmaciones por email.

### Para Administradores
- 📊 Dashboard de ventas.
- 📦 Gestión de productos (CRUD).
- 🚚 Gestión de pedidos y estados.
- 🏷️ Cupones de descuento.
- 💬 Moderación de reseñas.
- ⚙️ Configuración dinámica del sitio.

---

## 🔒 Seguridad
Este proyecto implementa mejores prácticas de seguridad:
- Headers HTTP seguros con **Helmet**.
- Protección contra ataques de fuerza bruta con **Rate Limiting**.
- Validación estricta de datos con **Express Validator**.
- Sanitización de inputs para prevenir inyección SQL (vía Sequelize).
- CORS configurado.

---

## 📄 Notas Adicionales
- Para que funcione la integración de WhatsApp, se debe escanear el QR que aparece en la terminal del backend al iniciar.
- Las imágenes de productos se almacenan localmente en `backend/uploads`.

---

Desarrollado con ❤️ para amantes de las fragancias.
