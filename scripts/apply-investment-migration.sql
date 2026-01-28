-- ================================================
-- MIGRACIÓN DE INVERSIONES - APLICACIÓN
-- Fecha: 2026-01-28
-- Total inversiones: 5
-- ================================================

-- IMPORTANTE: Antes de ejecutar, ajusta los valores de shares y purchasePrice
-- según tus datos reales. Los valores aquí son ESTIMADOS.

-- ================================================
-- 1. AAPL - Apple Inc.
-- ================================================
-- ID: 6948
-- Monto: 427.82 USD
-- Fecha: 2025-12-04
-- Estimado: 427.82 / ~230 (precio AAPL dic 2025) ≈ 1.86 acciones

UPDATE v2_transacciones
SET 
    extra = JSON_OBJECT(
        'ticker', 'AAPL',
        'shares', 1.86,
        'purchasePrice', 230.00
    ),
    description = 'Apple Inc. (AAPL)'
WHERE id = 6948 AND type = 'investment';

-- ================================================
-- 2. SPY - S&P 500 ETF (SPY500 - Dec 2025)
-- ================================================
-- ID: 6950
-- Monto: 1000 USD
-- Fecha: 2025-12-04
-- Estimado: 1000 / ~470 (precio SPY dic 2025) ≈ 2.13 acciones

UPDATE v2_transacciones
SET 
    extra = JSON_OBJECT(
        'ticker', 'SPY',
        'shares', 2.13,
        'purchasePrice', 670.00
    ),
    description = 'S&P 500 ETF (SPY)'
WHERE id = 6950 AND type = 'investment';

-- ================================================
-- 3. SPY - S&P 500 ETF (SP500 - Ene 2026)
-- ================================================
-- ID: 7076
-- Monto: 1000 USD
-- Fecha: 2026-01-01
-- Estimado: 1000 / ~595 (precio SPY ene 2026) ≈ 1.68 acciones

UPDATE v2_transacciones
SET 
    extra = JSON_OBJECT(
        'ticker', 'SPY',
        'shares', 1.68,
        'purchasePrice', 695.00
    ),
    description = 'S&P 500 ETF (SPY)'
WHERE id = 7076 AND type = 'investment';

-- ================================================
-- 4. SPY - S&P 500 ETF (SPY500 - Ene 2026)
-- ================================================
-- ID: 7128
-- Monto: 4000 USD
-- Fecha: 2026-01-21
-- Estimado: 4000 / ~600 (precio SPY ene 2026) ≈ 6.67 acciones

UPDATE v2_transacciones
SET 
    extra = JSON_OBJECT(
        'ticker', 'SPY',
        'shares', 6.67,
        'purchasePrice', 620.00
    ),
    description = 'S&P 500 ETF (SPY)'
WHERE id = 7128 AND type = 'investment';

-- ================================================
-- 5. SPY - S&P 500 ETF (SP500 - Ene 2026)
-- ================================================
-- ID: 16
-- Monto: 500 ARS
-- Fecha: 2026-01-27
-- ⚠️ ATENCIÓN: Está en ARS, no USD
-- Si es un error de moneda, corregir también el currency
-- Estimado: 500 ARS / ~600 ARS por acción ≈ 0.83 acciones

UPDATE v2_transacciones
SET 
    extra = JSON_OBJECT(
        'ticker', 'SPY',
        'shares', 0.83,
        'purchasePrice', 620.00
    ),
    description = 'S&P 500 ETF (SPY)',
    currency = 'USD'  -- Corregir moneda a USD
WHERE id = 16 AND type = 'investment';

-- ================================================
-- VERIFICACIÓN FINAL
-- ================================================
SELECT 
    id,
    description AS Empresa,
    JSON_EXTRACT(extra, '$.ticker') AS Ticker,
    CAST(JSON_EXTRACT(extra, '$.shares') AS DECIMAL(10,2)) AS Acciones,
    CAST(JSON_EXTRACT(extra, '$.purchasePrice') AS DECIMAL(10,2)) AS 'Precio Compra',
    amount AS 'Total Invertido',
    currency AS Moneda,
    date AS Fecha,
    CAST(JSON_EXTRACT(extra, '$.shares') AS DECIMAL(10,2)) * 
    CAST(JSON_EXTRACT(extra, '$.purchasePrice') AS DECIMAL(10,2)) AS 'Calculado'
FROM v2_transacciones
WHERE type = 'investment'
ORDER BY date DESC;

-- ================================================
-- RESUMEN AGRUPADO POR TICKER
-- ================================================
SELECT 
    JSON_EXTRACT(extra, '$.ticker') AS Ticker,
    SUM(CAST(JSON_EXTRACT(extra, '$.shares') AS DECIMAL(10,2))) AS 'Total Acciones',
    SUM(amount) AS 'Total Invertido',
    currency AS Moneda,
    COUNT(*) AS 'Num Transacciones'
FROM v2_transacciones
WHERE type = 'investment'
    AND extra IS NOT NULL
GROUP BY JSON_EXTRACT(extra, '$.ticker'), currency
ORDER BY SUM(amount) DESC;
