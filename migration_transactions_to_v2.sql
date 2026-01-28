-- Migración de transactions a v2_transacciones
-- Script seguro que verifica duplicados

-- 1. Primero, crear un backup (opcional pero recomendado)
-- CREATE TABLE v2_transacciones_backup AS SELECT * FROM v2_transacciones;

-- 2. Insertar datos de transactions en v2_transacciones
-- Solo inserta registros que no existan basándose en el ID del usuario y fecha/descripción
INSERT INTO v2_transacciones (
  id,
  userId,
  date,
  amount,
  currency,
  description,
  category,
  type,
  paymentMethod,
  tags,
  recurringId,
  createdAt,
  updatedAt,
  deleted,
  notes,
  extra
)
SELECT
  t.id,
  t.user_id,
  t.date,
  t.amount,
  COALESCE(t.currency, 'ARS') as currency,
  COALESCE(t.description, 'Sin descripción') as description,
  COALESCE(t.category, 'other') as category,
  COALESCE(t.type, 'ingreso') as type,
  NULL as paymentMethod,
  NULL as tags,
  NULL as recurringId,
  NOW() as createdAt,
  NOW() as updatedAt,
  0 as deleted,
  NULL as notes,
  NULL as extra
FROM transactions t
WHERE NOT EXISTS (
  SELECT 1 FROM v2_transacciones v2
  WHERE v2.userId = t.user_id
  AND v2.date = t.date
  AND v2.description = COALESCE(t.description, 'Sin descripción')
  AND v2.amount = t.amount
)
AND t.id IS NOT NULL;

-- 3. Verificar el resultado
SELECT 
  'Transacciones en tabla vieja' as tabla,
  COUNT(*) as total
FROM transactions
UNION ALL
SELECT
  'Transacciones en tabla nueva' as tabla,
  COUNT(*) as total
FROM v2_transacciones;

-- 4. Si todo está bien, puedes hacer un soft delete de los datos viejos
-- UPDATE transactions SET deleted = 1 WHERE id IN (SELECT id FROM v2_transacciones);

-- 5. Alternativamente, si quieres verificar qué se insertó:
-- SELECT * FROM v2_transacciones WHERE id IN (SELECT id FROM transactions) ORDER BY createdAt DESC LIMIT 10;
