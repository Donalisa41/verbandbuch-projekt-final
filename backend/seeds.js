// seeds.js - Testdaten für Entwicklung
// NUR FÜR LOKALE TESTS AUF DEINEM LAPTOP!

import { query } from './db/db.js';

console.log('Initialisiere Datenbankinhalt...');

// =================================================
// TESTDATEN FÜR UNFÄLLE
// =================================================
const testAccidents = [
    {
        name_verletzte_person: 'Max Mustermann',
        unfall_datum: '2024-11-10',
        unfall_uhrzeit: '14:30:00',
        ort: 'Büro 204, Gebäude A, 2. Stock',
        hergang: 'Beim Aufstehen vom Schreibtischstuhl ist dieser weggerutscht. Person ist rückwärts gestürzt und mit dem Kopf gegen die Heizung geschlagen.',
        art_der_verletzung: 'Beule am Hinterkopf, ca. 3cm Durchmesser, leichte Kopfschmerzen',
        zeugen: 'Anna Schmidt (Kollegin aus Nachbarbüro), Tel: 069-123456',
        erstehilfe_datum: '2024-11-10',
        erstehilfe_uhrzeit: '14:35:00',
        erstehilfe_massnahmen: 'Kühlung mit Kühlpack für 15 Minuten, Beobachtung auf Übelkeit/Schwindel. Keine weiteren Symptome.',
        ersthelfer_name: 'Dr. Weber (Betriebsärztin)',
        bearbeiter_id: 1
    },
    {
        name_verletzte_person: 'Sarah Hoffmann',
        unfall_datum: '2024-11-08',
        unfall_uhrzeit: '09:15:00',
        ort: 'Labor für Wasseranalytik, Untergeschoss Gebäude B',
        hergang: 'Beim Pipettieren von Salzsäure ist ein Tropfen auf den ungeschützten Handrücken gespritzt. Sofortige Reaktion mit Brennen und Rötung.',
        art_der_verletzung: 'Chemische Hautreizung am rechten Handrücken, 2x3cm rote Stelle',
        zeugen: 'keine Zeugen vorhanden (Einzelarbeit im Labor)',
        erstehilfe_datum: '2024-11-08',
        erstehilfe_uhrzeit: '09:16:00',
        erstehilfe_massnahmen: 'Sofortige Spülung mit reichlich Wasser für 10 Minuten. Desinfizierung und steriler Verband angelegt.',
        ersthelfer_name: 'Thomas Meyer (Laborleiter, Ersthelfer)',
        bearbeiter_id: 1
    },
    {
        name_verletzte_person: 'Dr. Michael Fischer',
        unfall_datum: '2024-11-05',
        unfall_uhrzeit: '16:45:00',
        ort: 'Außendienst: Restaurantinspektion, Frankfurter Str. 123',
        hergang: 'Beim Verlassen des Restaurants auf nasser Treppe ausgerutscht. Sturz auf das rechte Handgelenk.',
        art_der_verletzung: 'Verstauchung rechtes Handgelenk, starke Schmerzen bei Bewegung, leichte Schwellung',
        zeugen: 'Herr Rossi (Restaurantinhaber), anwesend bei Unfall',
        erstehilfe_datum: '2024-11-05',
        erstehilfe_uhrzeit: '17:00:00',
        erstehilfe_massnahmen: 'Handgelenk gekühlt und ruhiggestellt. Transport zum Durchgangsarzt veranlasst.',
        ersthelfer_name: 'Lisa Müller (Kollegin, per Telefon kontaktiert)',
        bearbeiter_id: 2
    },
    {
        name_verletzte_person: 'Anna Schmidt',
        unfall_datum: '2024-11-15', // Heute
        unfall_uhrzeit: '11:20:00',
        ort: 'Archiv, Untergeschoss Gebäude A',
        hergang: 'Schwerer Aktenordner aus oberem Regal gefallen und auf den Fuß getroffen beim Herausnehmen.',
        art_der_verletzung: 'Prellung rechter Fuß, Schmerzen beim Auftreten, kleine Schürfwunde',
        zeugen: 'Kollege aus Nachbarraum hat Aufprall gehört',
        erstehilfe_datum: '2024-11-15',
        erstehilfe_uhrzeit: '11:25:00',
        erstehilfe_massnahmen: 'Fuß gekühlt mit Kühlpack, Schürfwunde gereinigt und Pflaster angelegt. Beobachtung empfohlen.',
        ersthelfer_name: 'Petra Richter (Betriebssanitäterin)',
        bearbeiter_id: null // Noch nicht bearbeitet
    },
    {
        name_verletzte_person: 'Julia Weber',
        unfall_datum: '2024-10-28',
        unfall_uhrzeit: '08:45:00',
        ort: 'Küche Personalbereich, 1. Stock',
        hergang: 'Beim Aufwärmen des Mittagessens in der Mikrowelle ist heißer Dampf beim Öffnen der Tür ausgetreten.',
        art_der_verletzung: 'Leichte Verbrennung im Gesicht, gerötete Stelle an der Wange',
        zeugen: 'Lisa Beispiel (ebenfalls in der Küche anwesend)',
        erstehilfe_datum: '2024-10-28',
        erstehilfe_uhrzeit: '08:50:00',
        erstehilfe_massnahmen: 'Betroffene Stelle sofort mit kaltem Wasser gekühlt für 10 Minuten. Brandsalbe aufgetragen.',
        ersthelfer_name: 'Max Admin (Ersthelfer im Haus)',
        bearbeiter_id: 2
    }
];

// =================================================
// FUNCTION: TESTDATEN EINFÜGEN
// =================================================
async function insertTestAccidents() {
    console.log('Füge Testdaten für Unfälle ein...');
    
    for (let i = 0; i < testAccidents.length; i++) {
        const accident = testAccidents[i];
        
        try {
            const result = await query(`
                INSERT INTO accidents (
                    name_verletzte_person,
                    unfall_datum,
                    unfall_uhrzeit,
                    ort,
                    hergang,
                    art_der_verletzung,
                    zeugen,
                    erstehilfe_datum,
                    erstehilfe_uhrzeit,
                    erstehilfe_massnahmen,
                    ersthelfer_name,
                    bearbeiter_id
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                RETURNING id, name_verletzte_person
            `, [
                accident.name_verletzte_person,
                accident.unfall_datum,
                accident.unfall_uhrzeit,
                accident.ort,
                accident.hergang,
                accident.art_der_verletzung,
                accident.zeugen,
                accident.erstehilfe_datum,
                accident.erstehilfe_uhrzeit,
                accident.erstehilfe_massnahmen,
                accident.ersthelfer_name,
                accident.bearbeiter_id
            ]);
            
            console.log(`✓ Unfall ${i + 1}/5 eingefügt: ${result.rows[0].name_verletzte_person} (ID: ${result.rows[0].id})`);
            
        } catch (error) {
            console.error(`✗ Fehler bei Unfall ${i + 1}:`, error.message);
        }
    }
}

// =================================================
// FUNCTION: EXISTIERENDE TESTDATEN PRÜFEN
// =================================================
async function checkExistingData() {
    try {
        const result = await query('SELECT COUNT(*) as count FROM accidents');
        const count = parseInt(result.rows[0].count);
        
        console.log(`Aktuelle Anzahl Unfälle in Datenbank: ${count}`);
        
        if (count > 0) {
            console.log('⚠️  Datenbank enthält bereits Unfälle.');
            console.log('   Möchtest du die Testdaten trotzdem hinzufügen?');
            console.log('   (Duplikate sind möglich)');
        }
        
        return count;
        
    } catch (error) {
        console.error('Fehler beim Prüfen der Datenbank:', error.message);
        return -1;
    }
}

// =================================================
// FUNCTION: SEED-PROZESS AUSFÜHREN
// =================================================
async function runSeeds() {
    try {
        console.log('='.repeat(50));
        console.log('Verbandbuch: Beispieldaten werden geladen');
        console.log('='.repeat(50));
        
        // Prüfe vorhandene Daten
        const existingCount = await checkExistingData();
        
        if (existingCount === -1) {
            console.log('Fehler bei Datenbank-Verbindung');
            process.exit(1);
        }
        
        // Füge Testdaten ein
        await insertTestAccidents();
        
        // Prüfe finales Ergebnis
        const finalResult = await query('SELECT COUNT(*) as count FROM accidents');
        const finalCount = parseInt(finalResult.rows[0].count);
        
        console.log('\n' + '='.repeat(50));
        console.log('SEEDING ABGESCHLOSSEN');
        console.log('='.repeat(50));
        console.log(`Gesamt-Anzahl Unfälle in Datenbank: ${finalCount}`);
        console.log(`Neue Testdaten hinzugefügt: ${testAccidents.length}`);
        console.log('\nDatenbankinitialisierung erfolgreich abgeschlossen.');
        console.log('='.repeat(50));
        
        process.exit(0);
        
    } catch (error) {
        console.error('Kritischer Fehler beim Seeding:', error);
        process.exit(1);
    }
}

// =================================================
// NUR AUSFÜHREN WENN DEVELOPMENT
// =================================================
if (process.env.NODE_ENV === 'production') {
    console.log('Seeds sind in Produktion nicht erlaubt!');
    console.log('   Verwende NODE_ENV=development für Testdaten');
    process.exit(1);
}

// Seeds ausführen
runSeeds();