// ===================================================================
// INDEX.JS - EXPRESS.JS SERVER FÜR VERBANDBUCH (IHK-PROJEKT)
// ===================================================================

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import accidentsRoutes from './routes/accidents.js'; 

// Environment-Variablen laden
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

console.log('Verbandbuch-Server startet...');

// ===================================================================
// MIDDLEWARE KONFIGURATION
// ===================================================================

// CORS: Frontend-Backend-Kommunikation ermöglichen
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

console.log('CORS aktiviert für Frontend-Kommunikation');

// JSON Parser für API-Requests
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

console.log('JSON-Parser aktiviert');

// ===================================================================
// BASIS-ROUTEN
// ===================================================================

// Server-Status
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Verbandbuch-API läuft erfolgreich',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});

// Health Check für Monitoring
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
    });
});

// API-Dokumentation
app.get('/api', (req, res) => {
    res.json({
        message: 'Verbandbuch API v1.0',
        project: 'Digitales Verbandbuch für Gesundheitsamt Frankfurt',
        endpoints: {
            status: 'GET / - Server-Status',
            health: 'GET /health - Health-Check',
            accidents: 'GET|POST /api/accidents - Unfälle verwalten (noch nicht implementiert)',
            admin: 'POST /api/auth/login - Admin-Login (noch nicht implementiert)'
        },
        documentation: 'Siehe README.md für vollständige API-Dokumentation'
    });
});

// ACCIDENTS ROUTES
app.use('/api/accidents', accidentsRoutes); 

// ===================================================================
// ERROR-HANDLING
// ===================================================================

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route nicht gefunden',
        path: req.originalUrl,
        method: req.method,
        availableEndpoints: ['/', '/health', '/api']
    });
});

// Globaler Error Handler
app.use((error, req, res, next) => {
    console.error('Server-Fehler:', error);
    
    res.status(error.status || 500).json({
        success: false,
        error: process.env.NODE_ENV === 'development' 
            ? error.message 
            : 'Interner Server-Fehler',
        timestamp: new Date().toISOString()
    });
});

// ===================================================================
// SERVER STARTEN
// ===================================================================

app.listen(PORT, () => {
    console.log('\n==================================================');
    console.log('VERBANDBUCH-SERVER ERFOLGREICH GESTARTET');
    console.log('==================================================');
    console.log(`URL: http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Projekt: Digitales Verbandbuch (IHK-Abschlussprojekt)`);
    console.log('\nVerfügbare URLs:');
    console.log(`  Status:  http://localhost:${PORT}/`);
    console.log(`  Health:  http://localhost:${PORT}/health`);
    console.log(`  API:     http://localhost:${PORT}/api`);
    console.log('\nBereit für API-Entwicklung!');
    console.log('==================================================\n');
});