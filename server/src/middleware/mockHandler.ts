import type { Request, Response, NextFunction } from 'express';
import { stmts, findMatchingMock } from '../db.js';

function processTemplates(response: string): string {
  return response
    .replace(/\{\{timestamp\}\}/g, () => String(Date.now()))
    .replace(/\{\{randomInt\}\}/g, () => String(Math.floor(Math.random() * 10000)))
    .replace(/\{\{randomFloat\}\}/g, () => (Math.random() * 100).toFixed(2))
    .replace(/\{\{uuid\}\}/g, () => crypto.randomUUID())
    .replace(/\{\{datetime\}\}/g, () => new Date().toISOString())
    .replace(/\{\{randomBool\}\}/g, () => (Math.random() > 0.5 ? 'true' : 'false'));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function mockHandler(req: Request, res: Response, next: NextFunction) {
  if (req.path.startsWith('/mock')) return next();

  const start = Date.now();
  const api = findMatchingMock(req.method, req.path);

  if (!api) return next();

  if (api.delay > 0) {
    await sleep(api.delay);
  }

  const statusCode = api.status || 200;

  // Set custom headers
  try {
    const headers = JSON.parse(api.headers || '{}');
    for (const [key, value] of Object.entries(headers)) {
      res.setHeader(key, value as string);
    }
  } catch { /* ignore invalid headers json */ }

  try {
    const processed = processTemplates(api.response);
    res.status(statusCode).json(JSON.parse(processed));
  } catch {
    res.status(statusCode).json(api.response);
  }

  const duration = Date.now() - start;
  stmts.insertLog.run(req.method, req.path, statusCode, duration, req.ip);
}
