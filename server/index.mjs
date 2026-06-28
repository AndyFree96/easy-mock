import express, { response } from 'express';
import cors from 'cors';
import db from './db.mjs';

const PORT = 3000;
const app = express();
const mocks = [];

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const start = Date.now();

  const api = db
    .prepare(
      `SELECT * from mock_api
    WHERE path=? AND method=?
    `,
    )
    .get(req.path, req.method);

  if (api) {
    res.json(JSON.parse(api.response));

    const duration = Date.now() - start;

    db.prepare(
      `
      INSERT INTO request_log(method, path, status, time, ip) VALUES (?, ?, ?, ?, ?)
      `,
    ).run(req.method, req.path, 200, duration, req.ip);

    return;
  }

  next();
});

app.post('/mock/create', (req, res) => {
  const { method, path, response } = req.body;

  try {
    db.prepare(
      `
      INSERT INTO mock_api(method, path, response) VALUES (?, ?, ?)`,
    ).run(method, path, JSON.stringify(response));
    res.json({
      success: true,
    });
  } catch (e) {
    res.status(400).json({
      error: 'path already exists',
    });
  }
});

app.get('/mock/list', (req, res) => {
  const rows = db.prepare(`SELECT * FROM mock_api ORDER BY id DESC`).all();

  res.json(
    rows.map((x) => ({
      ...x,
      response: JSON.parse(x.response),
    })),
  );
});

app.get('/mock/test', async (req, res) => {
  const { path, method } = req.query;

  const start = Date.now();

  const api = db
    .prepare(
      `
    SELECT * FROM mock_api
    WHERE path=? AND method=?
    `,
    )
    .get(path, method);

  if (!api) {
    return res.status(404).json({
      error: 'Not Found',
    });
  }

  const duration = Date.now() - start;

  res.json({
    path,
    method,
    response: JSON.parse(api.response),
    duration,
  });
});

app.get('/mock/logs', (req, res) => {
  const logs = db
    .prepare(
      `
      SELECT * FROM request_log
      ORDER BY id DESC
      LIMIT 100
    `,
    )
    .all();

  res.json({
    message: 'success',
    data: logs,
  });
});

app.get('/mock/:id', (req, res) => {
  const id = req.params.id;
  const row = db.prepare(`SELECT * FROM mock_api WHERE id=?`).get(id);

  res.json({
    ...row,
    response: JSON.parse(row.response),
  });
});

app.delete('/mock/:id', (req, res) => {
  const id = req.params.id;

  db.prepare(
    `
    DELETE FROM mock_api WHERE id=?
    `,
  ).run(id);

  res.json({
    success: true,
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
