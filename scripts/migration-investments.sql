-- ================================================
-- MIGRATION: Inversiones - Agregar estructura extra
-- Fecha: 2026-01-28
-- ================================================

-- 1. VER TRANSACCIONES DE INVERSIÓN ACTUALES
SELECT 
    id,
    userId,
    date,
    amount,
    currency,
    description,
    category,
    type,
    extra,
    notes
FROM v2_transacciones
WHERE type = 'investment'
ORDER BY date DESC;

-- ================================================
-- 2. TEMPLATE PARA ACTUALIZAR INVERSIONES
-- ================================================
-- Copia este template para cada inversión y ajusta los valores:
--
-- UPDATE v2_transacciones
-- SET extra = JSON_OBJECT(
--     'ticker', 'AAPL',              -- Ticker de la acción
--     'shares', 10,                  -- Cantidad de acciones
--     'purchasePrice', 180.50        -- Precio de compra por acción
-- )
-- WHERE id = [ID_DE_LA_TRANSACCION];

-- ================================================
-- 3. EJEMPLOS DE MIGRACIÓN
-- ================================================
-- Descomenta y ajusta según tus datos reales

-- Ejemplo: Apple Inc.
-- UPDATE v2_transacciones
-- SET extra = JSON_OBJECT('ticker', 'AAPL', 'shares', 10, 'purchasePrice', 180.00),
--     description = 'Apple Inc.'
-- WHERE id = 1 AND type = 'investment';

-- Ejemplo: Grupo Galicia
-- UPDATE v2_transacciones
-- SET extra = JSON_OBJECT('ticker', 'GGAL', 'shares', 100, 'purchasePrice', 100.00),
--     description = 'Grupo Financiero Galicia'
-- WHERE id = 2 AND type = 'investment';

-- Ejemplo: YPF
-- UPDATE v2_transacciones
-- SET extra = JSON_OBJECT('ticker', 'YPF', 'shares', 50, 'purchasePrice', 200.00),
--     description = 'YPF S.A.'
-- WHERE id = 3 AND type = 'investment';

-- ================================================
-- 4. VERIFICAR RESULTADOS
-- ================================================
SELECT 
    id,
    description AS Empresa,
    JSON_EXTRACT(extra, '$.ticker') AS Ticker,
    JSON_EXTRACT(extra, '$.shares') AS Acciones,
    JSON_EXTRACT(extra, '$.purchasePrice') AS 'Precio Compra',
    amount AS 'Total Invertido',
    currency AS Moneda,
    date AS Fecha
FROM v2_transacciones
WHERE type = 'investment'
    AND extra IS NOT NULL
ORDER BY date DESC;

-- ================================================
-- 5. VALIDAR QUE TODAS TENGAN EL FORMATO CORRECTO
-- ================================================
SELECT 
    COUNT(*) AS 'Total Inversiones',
    SUM(CASE WHEN extra IS NULL THEN 1 ELSE 0 END) AS 'Sin estructura extra',
    SUM(CASE WHEN JSON_EXTRACT(extra, '$.ticker') IS NULL THEN 1 ELSE 0 END) AS 'Sin ticker',
    SUM(CASE WHEN JSON_EXTRACT(extra, '$.shares') IS NULL THEN 1 ELSE 0 END) AS 'Sin shares'
FROM v2_transacciones
WHERE type = 'investment';
