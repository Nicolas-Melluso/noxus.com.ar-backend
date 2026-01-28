/**
 * Script de migración para inversiones
 * Actualiza transacciones tipo 'investment' con estructura extra
 * 
 * Uso: node scripts/migrate-investments.js
 */

import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as readline from 'readline';

config();

// Configuración de base de datos
const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'noxus_db',
    synchronize: false,
    logging: true,
});

// Mapeo de inversiones (ajustar según tus datos reales)
const INVESTMENT_MAPPING = [
    // Ejemplo de mapeo - AJUSTAR CON TUS DATOS REALES
    // { description: 'Apple Inc.', ticker: 'AAPL', shares: 10, purchasePrice: 180 },
    // { description: 'Grupo Galicia', ticker: 'GGAL', shares: 100, purchasePrice: 100 },
    // { description: 'YPF', ticker: 'YPF', shares: 50, purchasePrice: 200 },
    
    // Agrega tus inversiones aquí:
    // { description: 'Nombre en DB', ticker: 'TICKER', shares: cantidad, purchasePrice: precio }
];

async function findInvestmentTransactions() {
    console.log('\n📊 Buscando transacciones de tipo investment...\n');
    
    const transactions = await AppDataSource.query(`
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
        ORDER BY date DESC
    `);
    
    return transactions;
}

async function migrateInvestments(dryRun = true) {
    try {
        await AppDataSource.initialize();
        console.log('✅ Conectado a la base de datos\n');
        
        // Buscar transacciones de inversión
        const transactions = await findInvestmentTransactions();
        
        if (transactions.length === 0) {
            console.log('❌ No se encontraron transacciones de tipo investment');
            return;
        }
        
        console.log(`📋 Encontradas ${transactions.length} transacciones de inversión:\n`);
        
        transactions.forEach((tx, index) => {
            console.log(`${index + 1}. ID: ${tx.id}`);
            console.log(`   Descripción: ${tx.description}`);
            console.log(`   Monto: ${tx.amount} ${tx.currency}`);
            console.log(`   Fecha: ${tx.date}`);
            console.log(`   Extra actual: ${tx.extra ? JSON.stringify(JSON.parse(tx.extra)) : 'NULL'}`);
            console.log('');
        });
        
        if (INVESTMENT_MAPPING.length === 0) {
            console.log('\n⚠️  INVESTMENT_MAPPING está vacío!');
            console.log('👉 Edita este archivo y agrega tus inversiones en INVESTMENT_MAPPING');
            console.log('');
            console.log('Ejemplo:');
            console.log('const INVESTMENT_MAPPING = [');
            console.log('    { description: "Apple Inc.", ticker: "AAPL", shares: 10, purchasePrice: 180 },');
            console.log('    { description: "Grupo Galicia", ticker: "GGAL", shares: 100, purchasePrice: 100 }');
            console.log('];');
            return;
        }
        
        console.log('\n📝 Configuración de mapeo:\n');
        INVESTMENT_MAPPING.forEach((mapping, index) => {
            console.log(`${index + 1}. ${mapping.description} → ${mapping.ticker} (${mapping.shares} acciones @ ${mapping.purchasePrice})`);
        });
        
        if (dryRun) {
            console.log('\n🔍 MODO DRY-RUN (no se aplicarán cambios)');
            console.log('Para ejecutar la migración real, ejecuta: node scripts/migrate-investments.js --apply\n');
            
            // Mostrar queries que se ejecutarían
            for (const tx of transactions) {
                const mapping = INVESTMENT_MAPPING.find(m => 
                    tx.description.toLowerCase().includes(m.description.toLowerCase()) ||
                    m.description.toLowerCase().includes(tx.description.toLowerCase())
                );
                
                if (mapping) {
                    const extra = {
                        ticker: mapping.ticker,
                        shares: mapping.shares,
                        purchasePrice: mapping.purchasePrice
                    };
                    
                    console.log(`UPDATE v2_transacciones`);
                    console.log(`SET extra = '${JSON.stringify(extra)}'`);
                    console.log(`WHERE id = ${tx.id};`);
                    console.log('');
                } else {
                    console.log(`⚠️  No se encontró mapeo para: ${tx.description} (ID: ${tx.id})`);
                    console.log('');
                }
            }
        } else {
            console.log('\n⚡ EJECUTANDO MIGRACIÓN...\n');
            
            let updated = 0;
            let skipped = 0;
            
            for (const tx of transactions) {
                const mapping = INVESTMENT_MAPPING.find(m => 
                    tx.description.toLowerCase().includes(m.description.toLowerCase()) ||
                    m.description.toLowerCase().includes(tx.description.toLowerCase())
                );
                
                if (mapping) {
                    const extra = {
                        ticker: mapping.ticker,
                        shares: mapping.shares,
                        purchasePrice: mapping.purchasePrice
                    };
                    
                    await AppDataSource.query(
                        `UPDATE v2_transacciones SET extra = ? WHERE id = ?`,
                        [JSON.stringify(extra), tx.id]
                    );
                    
                    console.log(`✅ Actualizado: ${tx.description} (ID: ${tx.id})`);
                    updated++;
                } else {
                    console.log(`⏭️  Omitido: ${tx.description} (ID: ${tx.id}) - Sin mapeo`);
                    skipped++;
                }
            }
            
            console.log(`\n✅ Migración completada:`);
            console.log(`   • Actualizados: ${updated}`);
            console.log(`   • Omitidos: ${skipped}`);
        }
        
    } catch (error) {
        console.error('❌ Error en la migración:', error);
    } finally {
        await AppDataSource.destroy();
    }
}

// Confirmar antes de aplicar cambios
async function confirmExecution() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    return new Promise((resolve) => {
        rl.question('\n¿Deseas aplicar estos cambios? (escribe "SI" para confirmar): ', (answer) => {
            rl.close();
            resolve(answer.toUpperCase() === 'SI');
        });
    });
}

// Ejecutar
const args = process.argv.slice(2);
const applyChanges = args.includes('--apply');

if (applyChanges) {
    console.log('⚠️  MODO APLICACIÓN - Los cambios se guardarán en la base de datos\n');
    const confirmed = await confirmExecution();
    if (confirmed) {
        await migrateInvestments(false);
    } else {
        console.log('❌ Migración cancelada');
    }
} else {
    await migrateInvestments(true);
}
