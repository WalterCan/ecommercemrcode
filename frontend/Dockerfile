# Imagen base de Node.js
FROM node:20-alpine

# Directorio de trabajo
WORKDIR /app

# Copiamos dependencias
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el código
COPY . .

# Exponemos el puerto por defecto de Vite (5173)
EXPOSE 5173

# Comando para iniciar Vite permitiendo conexiones externas (--host)
CMD ["npm", "run", "dev", "--", "--host","0.0.0.0","--port", "5173"]
