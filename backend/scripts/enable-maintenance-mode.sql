-- Script para activar el Modo de Mantenimiento
-- Ejecutar en MySQL para mostrar la pantalla futurista de "En Construcción"

-- Verificar configuración actual
SELECT * FROM settings WHERE `key` = 'maintenance_mode_active';

-- Activar modo de mantenimiento
INSERT INTO settings (`key`, `value`, description, createdAt, updatedAt)
VALUES ('maintenance_mode_active', 'true', 'Activar modo de mantenimiento', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    `value` = 'true',
    updatedAt = NOW();

-- Verificar que se activó correctamente
SELECT * FROM settings WHERE `key` = 'maintenance_mode_active';

-- Para DESACTIVAR el modo de mantenimiento más tarde:
-- UPDATE settings SET `value` = 'false' WHERE `key` = 'maintenance_mode_active';
