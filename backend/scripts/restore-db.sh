#!/bin/bash

#############################################
# Script de Restauración de MySQL
# E-commerce Platform
#############################################

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función de logging
log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Verificar argumentos
if [ -z "$1" ]; then
    log_error "Uso: $0 <archivo-backup.sql.gz>"
    echo ""
    echo "Ejemplos:"
    echo "  $0 backups/db-backup-2026-02-08-02-00.sql.gz"
    echo "  $0 \$(ls -t backups/*.sql.gz | head -1)  # Último backup"
    echo ""
    exit 1
fi

BACKUP_FILE="$1"

# Verificar que el archivo existe
if [ ! -f "$BACKUP_FILE" ]; then
    log_error "Archivo no encontrado: $BACKUP_FILE"
    exit 1
fi

# Cargar variables de entorno
if [ -f "$(dirname "$0")/../.env" ]; then
    export $(cat "$(dirname "$0")/../.env" | grep -v '^#' | xargs)
else
    log_error "Archivo .env no encontrado"
    exit 1
fi

# Verificar variables de entorno
if [ -z "$DB_HOST" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_NAME" ]; then
    log_error "Variables de entorno no configuradas correctamente"
    exit 1
fi

echo "========================================="
log_warning "ADVERTENCIA: Restauración de Base de Datos"
echo "========================================="
echo ""
log_info "Base de datos: $DB_NAME"
log_info "Host: $DB_HOST"
log_info "Archivo: $BACKUP_FILE"
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
log_info "Tamaño: $BACKUP_SIZE"
echo ""
log_warning "Esta operación SOBRESCRIBIRÁ todos los datos actuales"
echo ""
read -p "¿Estás seguro de continuar? (escribe 'SI' para confirmar): " CONFIRM

if [ "$CONFIRM" != "SI" ]; then
    log_error "Restauración cancelada por el usuario"
    exit 1
fi

echo ""
echo "========================================="
log_info "Iniciando restauración..."
echo "========================================="

# Usar MYSQL_PWD para evitar warning
export MYSQL_PWD="$DB_PASSWORD"

# Restaurar
gunzip < "$BACKUP_FILE" | mysql \
    -h "$DB_HOST" \
    -u "$DB_USER" \
    "$DB_NAME"

RESTORE_STATUS=$?

# Limpiar variable de password
unset MYSQL_PWD

# Verificar éxito
if [ $RESTORE_STATUS -eq 0 ]; then
    echo ""
    log_success "Restauración completada exitosamente"
    echo ""
    log_info "Verificando datos restaurados..."
    
    # Contar registros en tablas principales
    export MYSQL_PWD="$DB_PASSWORD"
    
    PRODUCTS_COUNT=$(mysql -h "$DB_HOST" -u "$DB_USER" -N -e "SELECT COUNT(*) FROM products;" "$DB_NAME" 2>/dev/null)
    ORDERS_COUNT=$(mysql -h "$DB_HOST" -u "$DB_USER" -N -e "SELECT COUNT(*) FROM orders;" "$DB_NAME" 2>/dev/null)
    USERS_COUNT=$(mysql -h "$DB_HOST" -u "$DB_USER" -N -e "SELECT COUNT(*) FROM users;" "$DB_NAME" 2>/dev/null)
    
    unset MYSQL_PWD
    
    echo ""
    log_info "Registros restaurados:"
    echo "  - Productos: $PRODUCTS_COUNT"
    echo "  - Órdenes: $ORDERS_COUNT"
    echo "  - Usuarios: $USERS_COUNT"
    echo ""
    log_success "Base de datos restaurada desde: $BACKUP_FILE"
else
    echo ""
    log_error "Error durante la restauración"
    log_error "Código de salida: $RESTORE_STATUS"
    exit 1
fi

exit 0
