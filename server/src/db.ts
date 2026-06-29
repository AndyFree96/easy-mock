import Database from 'better-sqlite3';
import { config } from './config.js';

const db = new Database(config.dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS mock_api(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    method TEXT NOT NULL,
    path TEXT NOT NULL,
    response TEXT NOT NULL,
    delay INTEGER DEFAULT 0,
    status INTEGER DEFAULT 200,
    headers TEXT DEFAULT '{}',
    enabled INTEGER DEFAULT 1,
    createAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(path, method)
  )
`);

// Migrate old tables missing columns
for (const col of [
  'ALTER TABLE mock_api ADD COLUMN status INTEGER DEFAULT 200',
  'ALTER TABLE mock_api ADD COLUMN headers TEXT DEFAULT \'{}\'',
  'ALTER TABLE mock_api ADD COLUMN enabled INTEGER DEFAULT 1',
]) {
  try { db.exec(col); } catch { /* already exists */ }
}

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

export const stmts = {
  insertMock: db.prepare(
    'INSERT INTO mock_api(method, path, response, delay, status, headers) VALUES (?, ?, ?, ?, ?, ?)'
  ),
  updateMock: db.prepare(
    'UPDATE mock_api SET method=?, path=?, response=?, delay=?, status=?, headers=?, enabled=? WHERE id=?'
  ),
  listMocks: db.prepare('SELECT * FROM mock_api ORDER BY id DESC'),
  listAllMocks: db.prepare('SELECT * FROM mock_api ORDER BY id DESC'),
  getMockById: db.prepare('SELECT * FROM mock_api WHERE id = ?'),
  deleteMock: db.prepare('DELETE FROM mock_api WHERE id = ?'),
  toggleMock: db.prepare('UPDATE mock_api SET enabled=? WHERE id=?'),
  searchMocks: db.prepare(
    'SELECT * FROM mock_api WHERE path LIKE ? OR method LIKE ? ORDER BY id DESC'
  ),

  insertLog: db.prepare(
    'INSERT INTO request_log(method, path, status, time, ip) VALUES (?, ?, ?, ?, ?)'
  ),
  listLogs: db.prepare('SELECT * FROM request_log ORDER BY id DESC LIMIT ? OFFSET ?'),
  countLogs: db.prepare('SELECT COUNT(*) as count FROM request_log'),
  listLogsFiltered: db.prepare(
    'SELECT * FROM request_log WHERE method = ? ORDER BY id DESC LIMIT ? OFFSET ?'
  ),
  countLogsFiltered: db.prepare(
    'SELECT COUNT(*) as count FROM request_log WHERE method = ?'
  ),

  countTotalRequests: db.prepare('SELECT COUNT(*) as count FROM request_log'),
  avgResponseTime: db.prepare('SELECT AVG(time) as avg FROM request_log'),
  methodDistribution: db.prepare(
    'SELECT method, COUNT(*) as count FROM request_log GROUP BY method'
  ),
  requestsLastHour: db.prepare(
    "SELECT COUNT(*) as count FROM request_log WHERE timestamp > datetime('now', '-1 hour')"
  ),
  topPaths: db.prepare(
    'SELECT path, method, COUNT(*) as count FROM request_log GROUP BY path, method ORDER BY count DESC LIMIT 10'
  ),
};

function pathToRegex(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/:(\w+)/g, '[^/]+');
  return new RegExp(`^${escaped}$`);
}

export function findMatchingMock(method: string, path: string) {
  const rows = stmts.listAllMocks.all() as any[];
  // First try exact match
  const exact = rows.find((r: any) => r.path === path && r.method === method && r.enabled);
  if (exact) return exact;
  // Then try pattern match
  return rows.find(
    (r: any) => r.method === method && r.enabled && (r.path.includes(':') || r.path.includes('*')) && pathToRegex(r.path).test(path)
  ) || null;
}

export { db };
