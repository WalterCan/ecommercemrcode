# D:\PROYECTOS\tiendavirtual\backend\Dockerfile
FROM node:20-alpine
# Directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema para puppeteer/chromium
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    font-noto-emoji \
    wqy-zenhei \
    dbus \
    && rm -rf /var/cache/apk/*

# Variables de entorno para puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    CHROME_BIN=/usr/bin/chromium-browser \
    PUPPETEER_DISABLE_PROCESS_SINGLETON=true \
    CHROMIUM_USER_FLAGS=--disable-features=ProcessSingleton \
    NODE_ENV=development

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de Node.js
RUN npm install

# Copiar código fuente
COPY . .

# Crear directorio para sesiones de WhatsApp con permisos correctos
RUN mkdir -p /app/whatsapp_sessions && \
    chmod 777 /app/whatsapp_sessions && \
    mkdir -p /tmp/chromium && \
    chmod 777 /tmp/chromium

# Puerto expuesto
EXPOSE 3001

# Comando de inicio
CMD ["npm", "run", "dev"]