import express, { response } from 'express';
import cors from 'cors';
import db from './db.mjs';

const PORT = 3000;
const app = express();
const mocks = [];

app.use(cors());
app.use(express.json());

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

app.use((req, res, next) => {
  const api = db
    .prepare(
      `SELECT * from mock_api
    WHERE path=? AND method=?
    `,
    )
    .get(req.path, req.method);

  if (api) {
    return res.json(JSON.parse(api.response));
  }

  next();
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
