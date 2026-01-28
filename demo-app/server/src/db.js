import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const DATA_DIR = path.resolve("data");
const DB_PATH = path.join(DATA_DIR, "ffs-demo.db");
const SEED_PATH = path.join(DATA_DIR, "seed.json");

const ensureDataDir = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
};

const seedIfEmpty = (db) => {
  const count = db.prepare("SELECT COUNT(*) as count FROM alerts").get().count;
  if (count > 0) {
    return;
  }

  const seed = JSON.parse(fs.readFileSync(SEED_PATH, "utf-8"));

  const insertCase = db.prepare(
    `INSERT INTO cases
      (id, title, status, priority, created_at, updated_at, summary, owner)
     VALUES
      (@id, @title, @status, @priority, @created_at, @updated_at, @summary, @owner)`
  );
  const insertAlert = db.prepare(
    `INSERT INTO alerts
      (id, created_at, member, risk_score, amount, channel, type, status, description, case_id)
     VALUES
      (@id, @created_at, @member, @risk_score, @amount, @channel, @type, @status, @description, @case_id)`
  );
  const insertTransaction = db.prepare(
    `INSERT INTO transactions
      (id, created_at, amount, channel, member, merchant, risk_score, case_id)
     VALUES
      (@id, @created_at, @amount, @channel, @member, @merchant, @risk_score, @case_id)`
  );

  const insertMany = db.transaction((rows, stmt) => {
    rows.forEach((row) => stmt.run(row));
  });

  insertMany(seed.cases, insertCase);
  insertMany(seed.alerts, insertAlert);
  insertMany(seed.transactions, insertTransaction);
};

export const initDb = () => {
  ensureDataDir();
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS cases (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      status TEXT NOT NULL,
      priority TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      summary TEXT NOT NULL,
      owner TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      member TEXT NOT NULL,
      risk_score REAL NOT NULL,
      amount REAL NOT NULL,
      channel TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      description TEXT NOT NULL,
      case_id TEXT
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      amount REAL NOT NULL,
      channel TEXT NOT NULL,
      member TEXT NOT NULL,
      merchant TEXT NOT NULL,
      risk_score REAL NOT NULL,
      case_id TEXT
    );
  `);

  seedIfEmpty(db);
  return db;
};
