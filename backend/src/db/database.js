const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

const dataDir = path.join(__dirname, "../../data");
fs.mkdirSync(dataDir, { recursive: true });

const dbFile = process.env.DB_FILE
  ? path.resolve(__dirname, "..", process.env.DB_FILE)
  : path.join(dataDir, "learnbridge.db");

const db = new Database(dbFile);
db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");

module.exports = db;
