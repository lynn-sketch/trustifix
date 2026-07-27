import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "data");
const DB_PATH = join(DATA_DIR, "db.json");

const emptyDb = () => ({
  users: [],
  providers: [],
  bookings: [],
  walletTxns: [],
  safetyAlerts: [],
  applications: [],
});

export function loadDb() {
  if (!existsSync(DB_PATH)) {
    mkdirSync(DATA_DIR, { recursive: true });
    const db = emptyDb();
    writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    return db;
  }
  return JSON.parse(readFileSync(DB_PATH, "utf8"));
}

export function saveDb(db) {
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

export function uid(prefix = "id") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
