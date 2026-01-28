-- ============================================================
-- RECALCULAR BALANCE DESDE v2_transacciones Y debts
-- ============================================================
-- Este script calcula el balance desde cero usando:
-- 1. v2_transacciones (income/expense)
-- 2. debts (deudas pendientes)
-- ============================================================

-- PASO 1: Ver el estado ACTUAL de los balances
SELECT '=== ESTADO ACTUAL ===' as info;
SELECT 
  userId,
  usd_ingresos, usd_egresos, usd_deudas,
  ars_ingresos, ars_egresos, ars_deudas,
  eur_ingresos, eur_egresos, eur_deudas
FROM v2_balances
ORDER BY userId;

-- PASO 2: Calcular lo que DEBERÍA ser el balance
SELECT '=== BALANCE CALCULADO DESDE v2_transacciones ===' as info;

SELECT 
  v.userId,
  COALESCE(SUM(CASE WHEN v.currency = 'USD' AND v.type = 'income' THEN v.amount ELSE 0 END), 0) as usd_ingresos_calc,
  COALESCE(SUM(CASE WHEN v.currency = 'USD' AND v.type = 'expense' THEN v.amount ELSE 0 END), 0) as usd_egresos_calc,
  COALESCE(SUM(CASE WHEN v.currency = 'ARS' AND v.type = 'income' THEN v.amount ELSE 0 END), 0) as ars_ingresos_calc,
  COALESCE(SUM(CASE WHEN v.currency = 'ARS' AND v.type = 'expense' THEN v.amount ELSE 0 END), 0) as ars_egresos_calc,
  COALESCE(SUM(CASE WHEN v.currency = 'EUR' AND v.type = 'income' THEN v.amount ELSE 0 END), 0) as eur_ingresos_calc,
  COALESCE(SUM(CASE WHEN v.currency = 'EUR' AND v.type = 'expense' THEN v.amount ELSE 0 END), 0) as eur_egresos_calc
FROM v2_transacciones v
WHERE v.deleted = 0
GROUP BY v.userId
ORDER BY v.userId;

-- PASO 3: Calcular deudas pendientes por moneda
SELECT '=== DEUDAS PENDIENTES CALCULADAS ===' as info;

SELECT 
  d.user_id,
  COALESCE(SUM(CASE WHEN d.currency = 'USD' THEN (d.amount - COALESCE(d.paid, 0)) ELSE 0 END), 0) as usd_deudas_calc,
  COALESCE(SUM(CASE WHEN d.currency = 'ARS' THEN (d.amount - COALESCE(d.paid, 0)) ELSE 0 END), 0) as ars_deudas_calc,
  COALESCE(SUM(CASE WHEN d.currency = 'EUR' THEN (d.amount - COALESCE(d.paid, 0)) ELSE 0 END), 0) as eur_deudas_calc
FROM debts d
WHERE d.status != 'paid'
GROUP BY d.user_id
ORDER BY d.user_id;

-- PASO 4: Mostrar la COMBINACIÓN de transacciones + deudas (lo que debería estar en v2_balances)
SELECT '=== BALANCE FINAL CALCULADO (Transacciones + Deudas) ===' as info;

SELECT 
  COALESCE(t.userId, d.user_id) as userId,
  COALESCE(t.usd_ingresos_calc, 0) as usd_ingresos,
  COALESCE(t.usd_egresos_calc, 0) as usd_egresos,
  COALESCE(d.usd_deudas_calc, 0) as usd_deudas,
  COALESCE(t.ars_ingresos_calc, 0) as ars_ingresos,
  COALESCE(t.ars_egresos_calc, 0) as ars_egresos,
  COALESCE(d.ars_deudas_calc, 0) as ars_deudas,
  COALESCE(t.eur_ingresos_calc, 0) as eur_ingresos,
  COALESCE(t.eur_egresos_calc, 0) as eur_egresos,
  COALESCE(d.eur_deudas_calc, 0) as eur_deudas
FROM (
  SELECT 
    userId,
    COALESCE(SUM(CASE WHEN currency = 'USD' AND type = 'income' THEN amount ELSE 0 END), 0) as usd_ingresos_calc,
    COALESCE(SUM(CASE WHEN currency = 'USD' AND type = 'expense' THEN amount ELSE 0 END), 0) as usd_egresos_calc,
    COALESCE(SUM(CASE WHEN currency = 'ARS' AND type = 'income' THEN amount ELSE 0 END), 0) as ars_ingresos_calc,
    COALESCE(SUM(CASE WHEN currency = 'ARS' AND type = 'expense' THEN amount ELSE 0 END), 0) as ars_egresos_calc,
    COALESCE(SUM(CASE WHEN currency = 'EUR' AND type = 'income' THEN amount ELSE 0 END), 0) as eur_ingresos_calc,
    COALESCE(SUM(CASE WHEN currency = 'EUR' AND type = 'expense' THEN amount ELSE 0 END), 0) as eur_egresos_calc
  FROM v2_transacciones
  WHERE deleted = 0
  GROUP BY userId
) t
LEFT JOIN (
  SELECT 
    user_id,
    COALESCE(SUM(CASE WHEN currency = 'USD' THEN (amount - COALESCE(paid, 0)) ELSE 0 END), 0) as usd_deudas_calc,
    COALESCE(SUM(CASE WHEN currency = 'ARS' THEN (amount - COALESCE(paid, 0)) ELSE 0 END), 0) as ars_deudas_calc,
    COALESCE(SUM(CASE WHEN currency = 'EUR' THEN (amount - COALESCE(paid, 0)) ELSE 0 END), 0) as eur_deudas_calc
  FROM debts
  WHERE status != 'paid'
  GROUP BY user_id
) d ON t.userId = d.user_id
ORDER BY COALESCE(t.userId, d.user_id);

-- PASO 5: Comparación ANTES vs DESPUÉS
SELECT '=== COMPARACION: ANTES (actual) vs DESPUÉS (calculado) ===' as info;

SELECT 
  COALESCE(b.userId, calc.userId) as userId,
  b.ars_ingresos as 'ARS_Ingresos_ANTES',
  calc.ars_ingresos as 'ARS_Ingresos_DESPUES',
  b.ars_egresos as 'ARS_Egresos_ANTES',
  calc.ars_egresos as 'ARS_Egresos_DESPUES',
  b.ars_deudas as 'ARS_Deudas_ANTES',
  calc.ars_deudas as 'ARS_Deudas_DESPUES',
  b.usd_ingresos as 'USD_Ingresos_ANTES',
  calc.usd_ingresos as 'USD_Ingresos_DESPUES',
  b.usd_egresos as 'USD_Egresos_ANTES',
  calc.usd_egresos as 'USD_Egresos_DESPUES',
  b.usd_deudas as 'USD_Deudas_ANTES',
  calc.usd_deudas as 'USD_Deudas_DESPUES'
FROM v2_balances b
LEFT JOIN (
  SELECT 
    COALESCE(t.userId, d.user_id) as userId,
    COALESCE(t.usd_ingresos_calc, 0) as usd_ingresos,
    COALESCE(t.usd_egresos_calc, 0) as usd_egresos,
    COALESCE(d.usd_deudas_calc, 0) as usd_deudas,
    COALESCE(t.ars_ingresos_calc, 0) as ars_ingresos,
    COALESCE(t.ars_egresos_calc, 0) as ars_egresos,
    COALESCE(d.ars_deudas_calc, 0) as ars_deudas,
    COALESCE(t.eur_ingresos_calc, 0) as eur_ingresos,
    COALESCE(t.eur_egresos_calc, 0) as eur_egresos,
    COALESCE(d.eur_deudas_calc, 0) as eur_deudas
  FROM (
    SELECT 
      userId,
      COALESCE(SUM(CASE WHEN currency = 'USD' AND type = 'income' THEN amount ELSE 0 END), 0) as usd_ingresos_calc,
      COALESCE(SUM(CASE WHEN currency = 'USD' AND type = 'expense' THEN amount ELSE 0 END), 0) as usd_egresos_calc,
      COALESCE(SUM(CASE WHEN currency = 'ARS' AND type = 'income' THEN amount ELSE 0 END), 0) as ars_ingresos_calc,
      COALESCE(SUM(CASE WHEN currency = 'ARS' AND type = 'expense' THEN amount ELSE 0 END), 0) as ars_egresos_calc,
      COALESCE(SUM(CASE WHEN currency = 'EUR' AND type = 'income' THEN amount ELSE 0 END), 0) as eur_ingresos_calc,
      COALESCE(SUM(CASE WHEN currency = 'EUR' AND type = 'expense' THEN amount ELSE 0 END), 0) as eur_egresos_calc
    FROM v2_transacciones
    WHERE deleted = 0
    GROUP BY userId
  ) t
  LEFT JOIN (
    SELECT 
      user_id,
      COALESCE(SUM(CASE WHEN currency = 'USD' THEN (amount - COALESCE(paid, 0)) ELSE 0 END), 0) as usd_deudas_calc,
      COALESCE(SUM(CASE WHEN currency = 'ARS' THEN (amount - COALESCE(paid, 0)) ELSE 0 END), 0) as ars_deudas_calc,
      COALESCE(SUM(CASE WHEN currency = 'EUR' THEN (amount - COALESCE(paid, 0)) ELSE 0 END), 0) as eur_deudas_calc
    FROM debts
    WHERE status != 'paid'
    GROUP BY user_id
  ) d ON t.userId = d.user_id
) calc ON b.userId = calc.userId
ORDER BY COALESCE(b.userId, calc.userId);

-- ============================================================
-- UNA VEZ VERIFIQUES LOS RESULTADOS ANTERIORES,
-- EJECUTA ESTO PARA ACTUALIZAR v2_balances:
-- ============================================================

UPDATE v2_balances b
JOIN (
  SELECT 
    COALESCE(t.userId, d.user_id) as userId,
    COALESCE(t.usd_ingresos_calc, 0) as usd_ingresos,
    COALESCE(t.usd_egresos_calc, 0) as usd_egresos,
    COALESCE(d.usd_deudas_calc, 0) as usd_deudas,
    COALESCE(t.ars_ingresos_calc, 0) as ars_ingresos,
    COALESCE(t.ars_egresos_calc, 0) as ars_egresos,
    COALESCE(d.ars_deudas_calc, 0) as ars_deudas,
    COALESCE(t.eur_ingresos_calc, 0) as eur_ingresos,
    COALESCE(t.eur_egresos_calc, 0) as eur_egresos,
    COALESCE(d.eur_deudas_calc, 0) as eur_deudas
  FROM (
    SELECT 
      userId,
      COALESCE(SUM(CASE WHEN currency = 'USD' AND type = 'income' THEN amount ELSE 0 END), 0) as usd_ingresos_calc,
      COALESCE(SUM(CASE WHEN currency = 'USD' AND type = 'expense' THEN amount ELSE 0 END), 0) as usd_egresos_calc,
      COALESCE(SUM(CASE WHEN currency = 'ARS' AND type = 'income' THEN amount ELSE 0 END), 0) as ars_ingresos_calc,
      COALESCE(SUM(CASE WHEN currency = 'ARS' AND type = 'expense' THEN amount ELSE 0 END), 0) as ars_egresos_calc,
      COALESCE(SUM(CASE WHEN currency = 'EUR' AND type = 'income' THEN amount ELSE 0 END), 0) as eur_ingresos_calc,
      COALESCE(SUM(CASE WHEN currency = 'EUR' AND type = 'expense' THEN amount ELSE 0 END), 0) as eur_egresos_calc
    FROM v2_transacciones
    WHERE deleted = 0
    GROUP BY userId
  ) t
  LEFT JOIN (
    SELECT 
      user_id,
      COALESCE(SUM(CASE WHEN currency = 'USD' THEN (amount - COALESCE(paid, 0)) ELSE 0 END), 0) as usd_deudas_calc,
      COALESCE(SUM(CASE WHEN currency = 'ARS' THEN (amount - COALESCE(paid, 0)) ELSE 0 END), 0) as ars_deudas_calc,
      COALESCE(SUM(CASE WHEN currency = 'EUR' THEN (amount - COALESCE(paid, 0)) ELSE 0 END), 0) as eur_deudas_calc
    FROM debts
    WHERE status != 'paid'
    GROUP BY user_id
  ) d ON t.userId = d.user_id
) calc ON b.userId = calc.userId
SET 
  b.usd_ingresos = calc.usd_ingresos,
  b.usd_egresos = calc.usd_egresos,
  b.usd_deudas = calc.usd_deudas,
  b.ars_ingresos = calc.ars_ingresos,
  b.ars_egresos = calc.ars_egresos,
  b.ars_deudas = calc.ars_deudas,
  b.eur_ingresos = calc.eur_ingresos,
  b.eur_egresos = calc.eur_egresos,
  b.eur_deudas = calc.eur_deudas;
