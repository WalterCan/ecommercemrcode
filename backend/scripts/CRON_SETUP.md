# Configuración de Cron para Backups Automáticos

## Opción 1: Cron en el Host (Recomendado)

Si estás ejecutando en un servidor Linux/Unix, configura cron en el host:

```bash
# Editar crontab
crontab -e

# Agregar esta línea (ajustar rutas según tu instalación)
0 2 * * * cd /path/to/ecommerce/backend && ./scripts/backup-db.sh >> logs/backup.log 2>&1
```

### Para Docker:

```bash
# Ejecutar backup dentro del contenedor desde el host
0 2 * * * docker exec ecommerce-backend /app/scripts/backup-db.sh >> /var/log/ecommerce-backup.log 2>&1
```

## Opción 2: Cron dentro del Contenedor Docker

### Modificar Dockerfile

Agregar al `backend/Dockerfile`:

```dockerfile
# Instalar cron
RUN apt-get update && apt-get install -y cron mysql-client

# Copiar script de cron
COPY scripts/backup-cron /etc/cron.d/backup-cron
RUN chmod 0644 /etc/cron.d/backup-cron
RUN crontab /etc/cron.d/backup-cron

# Crear archivo de log
RUN touch /var/log/cron.log

# Modificar CMD para iniciar cron
CMD cron && npm run dev
```

### Crear archivo de cron

Crear `backend/scripts/backup-cron`:

```cron
# Backup diario a las 2:00 AM
0 2 * * * root cd /app && /app/scripts/backup-db.sh >> /var/log/cron.log 2>&1

# Línea en blanco requerida al final del archivo

```

## Opción 3: Windows Task Scheduler

Si estás en Windows:

1. Abrir **Task Scheduler**
2. Crear nueva tarea básica
3. Configurar:
   - **Trigger**: Diario a las 2:00 AM
   - **Action**: Ejecutar programa
   - **Program**: `bash`
   - **Arguments**: `scripts/backup-db.sh`
   - **Start in**: `D:\PROYECTOS\ecommerce\backend`

## Verificación

### Verificar que cron está corriendo

```bash
# Linux
sudo service cron status

# Ver tareas programadas
crontab -l
```

### Verificar logs

```bash
# Ver últimas ejecuciones
tail -f backend/logs/backup.log

# Verificar que se crearon backups
ls -lh backend/backups/
```

### Probar manualmente

```bash
cd backend
./scripts/backup-db.sh
```

## Troubleshooting

### El backup no se ejecuta automáticamente

1. Verificar que cron está corriendo
2. Verificar permisos del script (`chmod +x scripts/backup-db.sh`)
3. Verificar rutas absolutas en crontab
4. Revisar logs de cron (`/var/log/syslog` o `/var/log/cron`)

### Error de permisos

```bash
chmod +x scripts/backup-db.sh
chmod +x scripts/restore-db.sh
chmod 700 backups/
```

### Variables de entorno no disponibles

Asegurarse de que el script carga `.env` correctamente o definir variables en crontab:

```cron
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=ecommercemrcode

0 2 * * * cd /path/to/backend && ./scripts/backup-db.sh
```

## Notificaciones (Opcional)

### Email en caso de error

Agregar al final de `backup-db.sh`:

```bash
if [ $? -ne 0 ]; then
    echo "Backup failed at $(date)" | mail -s "Backup Error" admin@example.com
fi
```

### Webhook a Slack/Discord

```bash
if [ $? -eq 0 ]; then
    curl -X POST -H 'Content-type: application/json' \
    --data '{"text":"✅ Backup exitoso"}' \
    YOUR_WEBHOOK_URL
fi
```
