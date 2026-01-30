#!/bin/bash
# Script para generar e instalar las migraciones FIXUS

echo "🔧 Generando migrations para FIXUS..."

# Generar la migración
npm run typeorm migration:generate -- -n CreateFixusTables

if [ $? -eq 0 ]; then
    echo "✅ Migration generada exitosamente"
    echo ""
    echo "📋 Ejecutando migrations..."
    
    # Ejecutar las migraciones
    npm run typeorm migration:run
    
    if [ $? -eq 0 ]; then
        echo "✅ Tablas FIXUS creadas exitosamente en la BD"
        echo ""
        echo "📊 Tablas creadas:"
        echo "  - fixus_routines"
        echo "  - fixus_persons"
        echo "  - fixus_trainer_codes"
        echo "  - fixus_trainer_requests"
        echo "  - fixus_linked_trainers"
        echo ""
        echo "✨ FIXUS module está listo para usar!"
    else
        echo "❌ Error ejecutando migrations"
        exit 1
    fi
else
    echo "❌ Error generando migration"
    exit 1
fi
