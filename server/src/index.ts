import express from 'express';
import cors from 'cors';
import { db } from './db.js';
import { config } from './config.js';
import { mockHandler } from './middleware/mockHandler.js';
import mockRouter from './routes/mock.js';

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: config.bodyLimit }));
app.use('/mock', mockRouter);
app.use(mockHandler);

const server = app.listen(config.port, () => {
  console.log(`EasyMock running at http://localhost:${config.port}`);
});

function shutdown() {
  console.log('\nShutting down...');
  server.close(() => {
    db.close();
    console.log('Server stopped.');
    process.exit(0);
  });
  setTimeout(() => {
    console.error('Forced exit.');
    process.exit(1);
  }, 5000);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
