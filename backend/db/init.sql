-- IHK-Abschlussprojekt: Digitales Verbandbuch
-- Datenbankschema für Entwicklungsumgebung
-- 
-- DESIGN-PRINZIPIEN:
-- - DGUV-konform: Alle rechtlich erforderlichen Felder
-- - Betreuer-Standards: Fremdschlüssel statt Text
-- - Entwicklungsfreundlich: DROP für saubere Neustarts

-- =================================================
-- TABELLEN LÖSCHEN (Entwicklungsumgebung)
-- =================================================
DROP TABLE IF EXISTS accidents CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;

-- Warum DROP in Entwicklung?
-- - Sauberer Neustart bei Schema-Änderungen
-- - Testdaten können jederzeit neu erstellt werden
-- - Keine echten Daten die verloren gehen

-- =================================================
-- ADMIN-BENUTZER-TABELLE
-- =================================================
CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =================================================
-- HAUPTTABELLE FÜR UNFÄLLE
-- =================================================
CREATE TABLE accidents (
    id SERIAL PRIMARY KEY,
    
    -- DGUV-PFLICHTFELDER (laut echtem Formular)
    -- Alle NOT NULL - rechtliche Anforderung
    name_verletzte_person TEXT NOT NULL,
    
    -- Unfall-Zeitpunkt (getrennt für bessere Handhabung)
    unfall_datum DATE NOT NULL,
    unfall_uhrzeit TIME NOT NULL,
    
    ort TEXT NOT NULL,
    hergang TEXT NOT NULL,
    art_der_verletzung TEXT NOT NULL,     -- Kombiniert Art + Umfang
    zeugen TEXT NOT NULL,                 -- Auch Pflichtfeld laut DGUV
    
    -- Erste-Hilfe-Maßnahmen (DGUV-Pflicht)
    erstehilfe_datum DATE NOT NULL,
    erstehilfe_uhrzeit TIME NOT NULL,
    erstehilfe_massnahmen TEXT NOT NULL,
    ersthelfer_name TEXT NOT NULL,
    
    -- Admin-Verwaltung (Betreuer-Standard: Fremdschlüssel)
    bearbeiter_id INTEGER REFERENCES admin_users(id),
    
    -- System-Zeitstempel (DSGVO und Nachvollziehbarkeit)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =================================================
-- PERFORMANCE-INDIZES
-- =================================================
-- Für häufige Suchabfragen im Admin-Dashboard
CREATE INDEX IF NOT EXISTS idx_accidents_datum ON accidents(unfall_datum);
CREATE INDEX IF NOT EXISTS idx_accidents_name ON accidents(name_verletzte_person);
CREATE INDEX IF NOT EXISTS idx_accidents_created ON accidents(created_at);

-- =================================================
-- AUTO-UPDATE TRIGGER
-- =================================================
-- Automatische Aktualisierung des updated_at Feldes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_accidents_updated_at 
    BEFORE UPDATE ON accidents 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =================================================
-- ADMIN-BENUTZER EINFÜGEN
-- =================================================
-- Passwort für beide: "test123" (nur für Entwicklung!)
INSERT INTO admin_users (username, password_hash, name, email) VALUES 
('admin', '$2b$10$N9qo8uLOickgx2ZMRZoMye6y8Lq8XPzKs6c0ZYeVEMrQ3KzXZBDG6', 'Fachkraft Arbeitssicherheit', 'sicherheit@test.local'),
('admin2', '$2b$10$N9qo8uLOickgx2ZMRZoMye6y8Lq8XPzKs6c0ZYeVEMrQ3KzXZBDG6', 'Stellvertretung', 'stellvertretung@test.local');

-- Hinweis: In Produktion werden sichere Passwörter verwendet!