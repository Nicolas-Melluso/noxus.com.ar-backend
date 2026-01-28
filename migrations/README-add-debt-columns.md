# Migración: Agregar columnas a tabla debts

## Fecha
27 de enero de 2026

## Descripción
Agrega las columnas `currency`, `category` y `status` a la tabla `debts` para soportar deudas multi-moneda con categorización.

## Columnas agregadas
- `currency` VARCHAR(10) DEFAULT 'ARS' - Moneda de la deuda (ARS, USD, EUR)
- `category` VARCHAR(50) NULL - Categoría de la deuda (food, transport, home, etc.)
- `status` VARCHAR(20) DEFAULT 'pending' - Estado de la deuda (pending, paid, overdue, upcoming)

## Instrucciones de ejecución

### En producción (servidor)
```bash
# Conectarse a MySQL
mysql -u root -p noxus_db

# O si tienes un usuario específico
mysql -u tu_usuario -p noxus_db

# Ejecutar el archivo de migración
source /root/noxus.com.ar-backend/migrations/add-debt-columns.sql
```

### Alternativa: Ejecutar directamente desde bash
```bash
mysql -u root -p noxus_db < /root/noxus.com.ar-backend/migrations/add-debt-columns.sql
```

## Verificación
Después de ejecutar la migración, verifica que las columnas se agregaron correctamente:

```sql
DESCRIBE debts;
```

Deberías ver algo como:
```
+-------------+---------------+------+-----+---------+----------------+
| Field       | Type          | Null | Key | Default | Extra          |
+-------------+---------------+------+-----+---------+----------------+
| id          | int           | NO   | PRI | NULL    | auto_increment |
| user_id     | int           | NO   |     | NULL    |                |
| description | varchar(255)  | NO   |     | NULL    |                |
| amount      | decimal(12,2) | NO   |     | NULL    |                |
| date        | varchar(255)  | YES  |     | NULL    |                |
| paid        | decimal(12,2) | NO   |     | 0.00    |                |
| currency    | varchar(10)   | NO   |     | ARS     |                |
| category    | varchar(50)   | YES  |     | NULL    |                |
| status      | varchar(20)   | NO   |     | pending |                |
+-------------+---------------+------+-----+---------+----------------+
```

## Rollback (en caso de necesitar revertir)
```sql
ALTER TABLE debts 
DROP COLUMN IF EXISTS currency,
DROP COLUMN IF EXISTS category,
DROP COLUMN IF EXISTS status;
```

## Notas
- Esta migración es compatible con MySQL 5.7+
- No afecta datos existentes, solo agrega columnas nuevas con valores por defecto
- Las deudas existentes se actualizarán automáticamente con `currency='ARS'` y `status='pending'`
