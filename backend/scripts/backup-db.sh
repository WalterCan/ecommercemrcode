#!/bin/bash

#############################################
# Script de Backup Automático de MySQL
# E-commerce Platform
#############################################

# Cargar variables de entorno
if [ -f ../.env ]; then
    export $(cat ../.env | grep -v '^#' | xargs)
fi

# Configuración
BACKUP_DIR="$(dirname "$0")/../backups"
DATE=$(date +%Y-%m-%d-%H-%M)
BACKUP_FILE="db-backup-$DATE.sql.gz"
RETENTION_DAYS=30
LOG_FILE="$(dirname "$0")/../logs/backup.log"

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función de logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

# Crear directorios si no existen
mkdir -p "$BACKUP_DIR"
mkdir -p "$(dirname "$LOG_FILE")"

log "========================================="
log "Iniciando backup de base de datos"
log "========================================="

# Verificar variables de entorno
if [ -z "$DB_HOST" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_NAME" ]; then
    log_error "Variables de entorno no configuradas correctamente"
    log_error "Asegúrate de que DB_HOST, DB_USER, DB_PASSWORD y DB_NAME estén definidas"
    exit 1
fi

log "Base de datos: $DB_NAME"
log "Host: $DB_HOST"
log "Archivo: $BACKUP_FILE"

# Realizar backup
log "Ejecutando mysqldump..."

# Usar MYSQL_PWD para evitar warning de password en línea de comandos
export MYSQL_PWD="$DB_PASSWORD"

mysqldump \
    -h "$DB_HOST" \
    -u "$DB_USER" \
    --single-transaction \
    --routines \
    --triggers \
    --events \
    "$DB_NAME" 2>> "$LOG_FILE" | gzip > "$BACKUP_DIR/$BACKUP_FILE"

BACKUP_STATUS=$?

# Limpiar variable de password
unset MYSQL_PWD

# Verificar éxito del backup
if [ $BACKUP_STATUS -eq 0 ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
    log_success "Backup completado exitosamente"
    log "Tamaño del archivo: $BACKUP_SIZE"
    log "Ubicación: $BACKUP_DIR/$BACKUP_FILE"
else
    log_error "Error durante el backup"
    log_error "Código de salida: $BACKUP_STATUS"
    exit 1
fi

# Eliminar backups antiguos
log "Eliminando backups antiguos (>$RETENTION_DAYS días)..."
DELETED_COUNT=$(find "$BACKUP_DIR" -name "db-backup-*.sql.gz" -mtime +$RETENTION_DAYS -type f | wc -l)

if [ $DELETED_COUNT -gt 0 ]; then
    find "$BACKUP_DIR" -name "db-backup-*.sql.gz" -mtime +$RETENTION_DAYS -type f -delete
    log_success "$DELETED_COUNT backup(s) antiguo(s) eliminado(s)"
else
    log "No hay backups antiguos para eliminar"
fi

# Listar backups actuales
CURRENT_BACKUPS=$(ls -1 "$BACKUP_DIR"/db-backup-*.sql.gz 2>/dev/null | wc -l)
log "Backups actuales: $CURRENT_BACKUPS"

# Calcular espacio total usado
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
log "Espacio total usado: $TOTAL_SIZE"

log "========================================="
log_success "Proceso de backup finalizado"
log "========================================="

exit 0
