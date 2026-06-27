import express from 'express';
import cors from 'cors';

const PORT = 3000;
const app = express();
const mocks = [];

app.use(cors());
app.use(express.json());

app.post('/mock/create', (req, res) => {
  const api = req.body;

  mocks.push(api);

  res.json({
    success: true,
  });
});

app.use((req, res, next) => {
  const api = mocks.find((x) => (x.path = req.path));
  if (api) {
    return res.json(api.response);
  }

  next();
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
