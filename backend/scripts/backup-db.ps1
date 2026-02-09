# ============================================
# Script de Backup Automático de MySQL
# E-commerce Platform - Windows PowerShell
# ============================================

# Configuración
$BackupDir = Join-Path $PSScriptRoot "..\backups"
$Date = Get-Date -Format "yyyy-MM-dd-HH-mm"
$BackupFile = "db-backup-$Date.sql.gz"
$RetentionDays = 30
$LogFile = Join-Path $PSScriptRoot "..\logs\backup.log"

# Función de logging
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogMessage = "[$Timestamp] [$Level] $Message"
    
    # Escribir a consola con colores
    switch ($Level) {
        "SUCCESS" { Write-Host "✅ $Message" -ForegroundColor Green }
        "ERROR"   { Write-Host "❌ $Message" -ForegroundColor Red }
        "WARNING" { Write-Host "⚠️  $Message" -ForegroundColor Yellow }
        default   { Write-Host "ℹ️  $Message" -ForegroundColor Cyan }
    }
    
    # Escribir a archivo de log
    Add-Content -Path $LogFile -Value $LogMessage
}

# Crear directorios si no existen
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}
if (-not (Test-Path (Split-Path $LogFile))) {
    New-Item -ItemType Directory -Path (Split-Path $LogFile) | Out-Null
}

Write-Log "========================================="
Write-Log "Iniciando backup de base de datos"
Write-Log "========================================="

# Cargar variables de entorno desde .env
$EnvFile = Join-Path $PSScriptRoot "..\.env"
if (Test-Path $EnvFile) {
    Get-Content $EnvFile | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            Set-Item -Path "env:$name" -Value $value
        }
    }
    Write-Log "Variables de entorno cargadas desde .env"
} else {
    Write-Log "Archivo .env no encontrado" "ERROR"
    exit 1
}

# Verificar variables de entorno
if (-not $env:DB_HOST -or -not $env:DB_USER -or -not $env:DB_PASSWORD -or -not $env:DB_NAME) {
    Write-Log "Variables de entorno no configuradas correctamente" "ERROR"
    Write-Log "Asegúrate de que DB_HOST, DB_USER, DB_PASSWORD y DB_NAME estén definidas" "ERROR"
    exit 1
}

Write-Log "Base de datos: $env:DB_NAME"
Write-Log "Host: $env:DB_HOST"
Write-Log "Archivo: $BackupFile"

# Verificar si mysqldump está disponible
try {
    $null = Get-Command mysqldump -ErrorAction Stop
} catch {
    Write-Log "mysqldump no encontrado. Instala MySQL Client Tools" "ERROR"
    Write-Log "Descarga desde: https://dev.mysql.com/downloads/mysql/" "ERROR"
    exit 1
}

# Realizar backup
Write-Log "Ejecutando mysqldump..."

$BackupPath = Join-Path $BackupDir $BackupFile
$TempSqlFile = Join-Path $BackupDir "temp-backup.sql"

try {
    # Ejecutar mysqldump
    $mysqldumpArgs = @(
        "-h", $env:DB_HOST,
        "-u", $env:DB_USER,
        "-p$($env:DB_PASSWORD)",
        "--single-transaction",
        "--routines",
        "--triggers",
        "--events",
        $env:DB_NAME
    )
    
    mysqldump @mysqldumpArgs | Out-File -FilePath $TempSqlFile -Encoding UTF8
    
    if ($LASTEXITCODE -ne 0) {
        throw "mysqldump falló con código de salida $LASTEXITCODE"
    }
    
    # Comprimir con gzip (si está disponible) o usar compresión de PowerShell
    if (Get-Command gzip -ErrorAction SilentlyContinue) {
        gzip -c $TempSqlFile | Set-Content -Path $BackupPath -Encoding Byte
    } else {
        # Usar compresión de PowerShell
        Compress-Archive -Path $TempSqlFile -DestinationPath "$BackupPath.zip" -Force
        Rename-Item "$BackupPath.zip" $BackupPath
    }
    
    # Eliminar archivo temporal
    Remove-Item $TempSqlFile -Force
    
    $BackupSize = (Get-Item $BackupPath).Length / 1MB
    Write-Log "Backup completado exitosamente" "SUCCESS"
    Write-Log "Tamaño del archivo: $([math]::Round($BackupSize, 2)) MB"
    Write-Log "Ubicación: $BackupPath"
    
} catch {
    Write-Log "Error durante el backup: $_" "ERROR"
    if (Test-Path $TempSqlFile) {
        Remove-Item $TempSqlFile -Force
    }
    exit 1
}

# Eliminar backups antiguos
Write-Log "Eliminando backups antiguos (>$RetentionDays días)..."
$CutoffDate = (Get-Date).AddDays(-$RetentionDays)
$OldBackups = Get-ChildItem -Path $BackupDir -Filter "db-backup-*.sql.gz" | 
              Where-Object { $_.LastWriteTime -lt $CutoffDate }

if ($OldBackups) {
    $OldBackups | Remove-Item -Force
    Write-Log "$($OldBackups.Count) backup(s) antiguo(s) eliminado(s)" "SUCCESS"
} else {
    Write-Log "No hay backups antiguos para eliminar"
}

# Listar backups actuales
$CurrentBackups = Get-ChildItem -Path $BackupDir -Filter "db-backup-*.sql.gz"
Write-Log "Backups actuales: $($CurrentBackups.Count)"

# Calcular espacio total usado
$TotalSize = ($CurrentBackups | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Log "Espacio total usado: $([math]::Round($TotalSize, 2)) MB"

Write-Log "========================================="
Write-Log "Proceso de backup finalizado" "SUCCESS"
Write-Log "========================================="

exit 0
