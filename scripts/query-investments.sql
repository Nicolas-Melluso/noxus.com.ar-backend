-- ================================================
-- QUERY: Ver todas las inversiones
-- ================================================

-- Query básico - Ver todas las inversiones
SELECT 
    id,
    userId,
    date,
    amount,
    currency,
    description,
    category,
    extra
FROM v2_transacciones
WHERE type = 'investment'
ORDER BY date DESC;

-- ================================================
-- Query detallado - Con datos del campo extra
-- ================================================
SELECT 
    id,
    date AS Fecha,
    description AS Descripción,
    amount AS Monto,
    currency AS Moneda,
    JSON_EXTRACT(extra, '$.ticker') AS Ticker,
    JSON_EXTRACT(extra, '$.shares') AS Acciones,
    JSON_EXTRACT(extra, '$.purchasePrice') AS 'Precio Compra',
    CASE 
        WHEN extra IS NULL THEN '❌ Sin estructura'
        WHEN JSON_EXTRACT(extra, '$.ticker') IS NULL THEN '⚠️ Falta ticker'
        ELSE '✅ OK'
    END AS Estado
FROM v2_transacciones
WHERE type = 'investment'
ORDER BY date DESC;

-- ================================================
-- Query agrupado - Por ticker
-- ================================================
SELECT 
    JSON_EXTRACT(extra, '$.ticker') AS Ticker,
    COUNT(*) AS 'Num Compras',
    SUM(CAST(JSON_EXTRACT(extra, '$.shares') AS DECIMAL(10,4))) AS 'Total Acciones',
    SUM(amount) AS 'Total Invertido',
    currency AS Moneda,
    MIN(date) AS 'Primera Compra',
    MAX(date) AS 'Última Compra'
FROM v2_transacciones
WHERE type = 'investment'
    AND extra IS NOT NULL
GROUP BY JSON_EXTRACT(extra, '$.ticker'), currency
ORDER BY SUM(amount) DESC;
