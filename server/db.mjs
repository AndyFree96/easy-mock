import Database from 'better-sqlite3';

const db = new Database('easymock.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS mock_api(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    method TEXT NOT NULL,
    path TEXT NOT NULL UNIQUE,
    response TEXT NOT NULL,
    createAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS request_log(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    method TEXT,
    path TEXT,
    status INTEGER,
    time INTEGER,
    ip TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
  `);

export default db;
