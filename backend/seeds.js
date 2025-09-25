// backend/seeds.js
// ================================================================
// Seeds für "accidents" mit robustem Setup
// - Liest .env (PG_* Variablen)
// - Legt Tabelle an, falls nicht vorhanden
// - Optional: TRUNCATE (leer räumen) vor Insert
// - Nutzt parameterisierte Inserts
// - ON CONFLICT DO NOTHING (falls du später Unique-Keys ergänzt)
// ================================================================
import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const {
  PG_USER = "postgres",
  PG_PASSWORD = "1234",
  PG_HOST = "localhost",
  PG_PORT = "5432",
  PG_DATABASE = "verbandbuch",
  LOG_SQL_QUERIES = "true",
} = process.env;

const pool = new pg.Pool({
  user: PG_USER,
  password: PG_PASSWORD,
  host: PG_HOST,
  port: Number(PG_PORT),
  database: PG_DATABASE,
});

const TRUNCATE_FIRST = false; // <-- wenn true, werden alte Daten gelöscht

const SAMPLES = [
  {
    name_verletzte_person: "Max Mustermann",
    unfall_datum: "2024-10-01",
    unfall_uhrzeit: "09:15:00",
    ort: "Lagerhalle A",
    hergang: "Beim Heben einer Kiste ausgerutscht.",
    art_der_verletzung: "Prellung rechter Fuß",
    zeugen: "Erika Beispiel",
    erstehilfe_datum: "2024-10-01",
    erstehilfe_uhrzeit: "09:20:00",
    erstehilfe_massnahmen: "Fuß gekühlt, Pflaster",
    ersthelfer_name: "Petra Richter",
    bearbeiter_id: 1,
  },
  {
    name_verletzte_person: "Anna Schmidt",
    unfall_datum: "2024-10-20",
    unfall_uhrzeit: "14:05:00",
    ort: "Büro EG",
    hergang: "Am Kopierer gestoßen.",
    art_der_verletzung: "Schürfwunde Handrücken",
    zeugen: "—",
    erstehilfe_datum: "2024-10-20",
    erstehilfe_uhrzeit: "14:08:00",
    erstehilfe_massnahmen: "Wunde gereinigt, Pflaster",
    ersthelfer_name: "Max Admin",
    bearbeiter_id: 2,
  },
  {
    name_verletzte_person: "Julia Weber",
    unfall_datum: "2024-10-28",
    unfall_uhrzeit: "08:45:00",
    ort: "Küche Personalbereich, 1. Stock",
    hergang:
      "Beim Öffnen der Mikrowelle kam heißer Dampf heraus.",
    art_der_verletzung: "Leichte Verbrennung Wange",
    zeugen: "Lisa Beispiel",
    erstehilfe_datum: "2024-10-28",
    erstehilfe_uhrzeit: "08:50:00",
    erstehilfe_massnahmen:
      "Mit kaltem Wasser gekühlt, Brandsalbe aufgetragen.",
    ersthelfer_name: "Max Admin",
    bearbeiter_id: 2,
  },
];

async function ensureSchema(client) {
  const createSql = `
    CREATE TABLE IF NOT EXISTS accidents (
      id SERIAL PRIMARY KEY,
      name_verletzte_person TEXT NOT NULL,
      unfall_datum DATE NOT NULL,
      unfall_uhrzeit TIME NOT NULL,
      ort TEXT NOT NULL,
      hergang TEXT,
      art_der_verletzung TEXT,
      zeugen TEXT,
      erstehilfe_datum DATE,
      erstehilfe_uhrzeit TIME,
      erstehilfe_massnahmen TEXT,
      ersthelfer_name TEXT,
      bearbeiter_id INTEGER,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;
  if (LOG_SQL_QUERIES === "true") {
    console.log("SQL-Query: CREATE TABLE IF NOT EXISTS accidents");
  }
  await client.query(createSql);
}

async function truncateIfNeeded(client) {
  if (!TRUNCATE_FIRST) return;
  if (LOG_SQL_QUERIES === "true") console.log("SQL-Query: TRUNCATE TABLE accidents RESTART IDENTITY");
  await client.query("TRUNCATE TABLE accidents RESTART IDENTITY;");
}

async function insertSamples(client) {
  const insertSql = `
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
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12
    )
    RETURNING id, name_verletzte_person;
  `;

  for (let i = 0; i < SAMPLES.length; i++) {
    const s = SAMPLES[i];
    const params = [
      s.name_verletzte_person,
      s.unfall_datum,
      s.unfall_uhrzeit,
      s.ort,
      s.hergang,
      s.art_der_verletzung,
      s.zeugen,
      s.erstehilfe_datum,
      s.erstehilfe_uhrzeit,
      s.erstehilfe_massnahmen,
      s.ersthelfer_name,
      s.bearbeiter_id,
    ];
    if (LOG_SQL_QUERIES === "true") {
      console.log("SQL-Query: INSERT INTO accidents ...");
      console.log("Parameter:", params);
    }
    const { rows } = await client.query(insertSql, params);
    console.log(`✓ Insert: ${rows[0].name_verletzte_person} (ID: ${rows[0].id})`);
  }
}

async function countRows(client) {
  const { rows } = await client.query("SELECT COUNT(*)::int AS count FROM accidents;");
  return rows[0].count;
}

(async () => {
  console.log("Initialisiere Datenbankinhalt...");
  const client = await pool.connect();
  try {
    await ensureSchema(client);
    await truncateIfNeeded(client);
    await insertSamples(client);
    const count = await countRows(client);
    console.log("\nSEEDING ABGESCHLOSSEN");
    console.log("==================================================");
    console.log(`Gesamt-Anzahl Unfälle in Datenbank: ${count}`);
    console.log("==================================================\n");
  } catch (err) {
    console.error("❌ Seeding-Fehler:", err?.message || err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
})();
