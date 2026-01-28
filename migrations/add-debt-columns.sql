-- Agregar columnas faltantes a la tabla debts
-- Ejecutar en la base de datos de producción

ALTER TABLE debts 
ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'ARS' AFTER paid,
ADD COLUMN IF NOT EXISTS category VARCHAR(50) NULL AFTER currency,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' AFTER category;

-- Actualizar deudas existentes para tener valores por defecto
UPDATE debts SET currency = 'ARS' WHERE currency IS NULL OR currency = '';
UPDATE debts SET status = 'pending' WHERE status IS NULL OR status = '';

-- Opcional: Verificar la estructura de la tabla
-- DESCRIBE debts;
