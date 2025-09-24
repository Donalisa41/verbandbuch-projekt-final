// ===================================================================
// DB.JS - POSTGRESQL CONNECTION POOL FÜR VERBANDBUCH
// ===================================================================
//
// ZWECK: Zentrale Datenbankverbindung für alle Controller
// WARUM: Connection Pooling für Performance und Skalierbarkeit
// BETREUER-STANDARD: Promise-Chains statt async/await

// ===================================================================
// BLOCK 1: IMPORTS UND KONFIGURATION
// ===================================================================

import pkg from 'pg';              // PostgreSQL-Client für Node.js
const { Pool } = pkg;              // Pool-Klasse für Connection-Management
import dotenv from 'dotenv';       // Environment-Variablen

// Environment-Variablen laden (falls noch nicht geladen)
dotenv.config();

// ===================================================================
// BLOCK 2: CONNECTION POOL KONFIGURATION
// ===================================================================

const pool = new Pool({
    // PostgreSQL-Verbindungsparameter aus .env
    user: process.env.PG_USER,           // postgres
    password: process.env.PG_PASSWORD,   // IhrSicheresPasswort123
    host: process.env.PG_HOST,           // localhost
    port: process.env.PG_PORT,           // 5432
    database: process.env.PG_DATABASE,   // verbandbuch
    
    // Pool-Konfiguration (Performance-Optimierung)
    max: 20,                    // Maximal 20 gleichzeitige Verbindungen
    min: 2,                     // Mindestens 2 Verbindungen warm halten
    idleTimeoutMillis: 30000,   // Verbindung nach 30s Inaktivität schließen
    connectionTimeoutMillis: 5000,  // Max 5s warten auf freie Verbindung
    
    // Development vs Production
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// ===================================================================
// BLOCK 3: POOL EVENT-HANDLER (Debugging und Monitoring)
// ===================================================================

// Verbindung erfolgreich hergestellt
pool.on('connect', (client) => {
    if (process.env.NODE_ENV === 'development') {
        console.log('✓ Neue PostgreSQL-Verbindung hergestellt');
    }
});

// Verbindung getrennt
pool.on('remove', (client) => {
    if (process.env.NODE_ENV === 'development') {
        console.log('- PostgreSQL-Verbindung geschlossen');
    }
});

// Fehler beim Pool-Management
pool.on('error', (err, client) => {
    console.error('❌ PostgreSQL Pool-Fehler:', err);
    process.exit(-1);  // Server beenden bei kritischen DB-Fehlern
});

// ===================================================================
// BLOCK 4: QUERY-FUNKTION (Betreuer-Standard: Promise-Chains)
// ===================================================================

/**
 * Führt SQL-Query mit Promise-Chain aus (Betreuer-Standard)
 * @param {string} text - SQL-Query mit Platzhaltern ($1, $2, ...)
 * @param {array} params - Parameter für die Platzhalter
 * @returns {Promise} - PostgreSQL-Result-Objekt
 */
const query = (text, params = []) => {
    // Optional: SQL-Queries loggen (nur Development)
    if (process.env.LOG_SQL_QUERIES === 'true' && process.env.NODE_ENV === 'development') {
        console.log('🔍 SQL-Query:', text);
        console.log('📋 Parameter:', params);
    }
    
    // Promise-Chain für Query-Ausführung
    return pool.query(text, params)
        .then(result => {
            // Optional: Query-Ergebnis loggen
            if (process.env.LOG_SQL_QUERIES === 'true' && process.env.NODE_ENV === 'development') {
                console.log(`✓ Query erfolgreich: ${result.rowCount} Zeilen betroffen`);
            }
            return result;
        })
        .catch(error => {
            // Detailliertes Error-Logging
            console.error('❌ SQL-Query-Fehler:', {
                query: text,
                params: params,
                error: error.message,
                detail: error.detail,
                position: error.position,
                timestamp: new Date().toISOString()
            });
            
            // Error weiterwerfen für Controller-Handling
            throw error;
        });
};

// ===================================================================
// BLOCK 5: VERBINDUNGSTEST (Startup-Validierung)
// ===================================================================

/**
 * Testet die Datenbankverbindung beim Server-Start
 * Verhindert Server-Start bei DB-Problemen
 */
const testConnection = () => {
    return query('SELECT NOW() as current_time, version() as postgres_version')
        .then(result => {
            const row = result.rows[0];
            console.log('\n' + '='.repeat(50));
            console.log('✓ POSTGRESQL-VERBINDUNG ERFOLGREICH');
            console.log('='.repeat(50));
            console.log(`Datenbank: ${process.env.PG_DATABASE}`);
            console.log(`Host: ${process.env.PG_HOST}:${process.env.PG_PORT}`);
            console.log(`Server-Zeit: ${row.current_time}`);
            console.log(`PostgreSQL: ${row.postgres_version.split(' ')[0]} ${row.postgres_version.split(' ')[1]}`);
            console.log(`Pool-Status: Max ${pool.options.max} Verbindungen`);
            console.log('='.repeat(50) + '\n');
            return true;
        })
        .catch(error => {
            console.error('\n' + '='.repeat(50));
            console.error('❌ POSTGRESQL-VERBINDUNG FEHLGESCHLAGEN');
            console.error('='.repeat(50));
            console.error('Fehler:', error.message);
            console.error('Host:', process.env.PG_HOST);
            console.error('Database:', process.env.PG_DATABASE);
            console.error('User:', process.env.PG_USER);
            console.error('\nPrüfe deine .env-Datei und PostgreSQL-Server!');
            console.error('='.repeat(50) + '\n');
            
            // Server NICHT starten bei DB-Problemen
            process.exit(1);
        });
};

// ===================================================================
// BLOCK 6: GRACEFUL SHUTDOWN (Sauberes Herunterfahren)
// ===================================================================

/**
 * Schließt alle DB-Verbindungen beim Server-Stopp
 * Verhindert "hanging connections"
 */
const closePool = () => {
    console.log('\n🔄 Schließe PostgreSQL-Verbindungen...');
    
    return pool.end()
        .then(() => {
            console.log('✓ Alle PostgreSQL-Verbindungen geschlossen');
        })
        .catch(error => {
            console.error('❌ Fehler beim Schließen der DB-Verbindungen:', error);
        });
};

// Graceful Shutdown bei SIGTERM/SIGINT
process.on('SIGTERM', closePool);
process.on('SIGINT', closePool);

// ===================================================================
// BLOCK 7: EXPORTS (Was andere Dateien verwenden können)
// ===================================================================

// Hauptexport: query-Funktion für Controller
export { query };

// Zusätzliche Exports für erweiterte Nutzung
export { pool, testConnection, closePool };

// ===================================================================
// VERWENDUNG IN ANDEREN DATEIEN:
// ===================================================================
//
// controllers/accidentsController.js:
// import { query } from '../db/db.js';
//
// seeds.js:
// import { query } from './db/db.js';
//
// routes/accidents.js:
// import { query } from '../db/db.js';  (falls direkt gebraucht)