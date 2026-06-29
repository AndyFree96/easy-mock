import { Router } from 'express';
import { stmts, db } from '../db.js';

const router = Router();

// ── Named routes (before /:id to avoid collision) ──

router.get('/list', (req, res) => {
  const search = req.query.search as string | undefined;
  let rows: any[];

  if (search) {
    rows = stmts.searchMocks.all(`%${search}%`, `%${search}%`);
  } else {
    rows = stmts.listMocks.all();
  }

  res.json(
    rows.map((x) => ({
      ...x,
      response: JSON.parse(x.response),
      headers: JSON.parse(x.headers || '{}'),
    }))
  );
});

router.get('/stats', (req, res) => {
  const total = (stmts.countTotalRequests.get() as any).count;
  const avg = (stmts.avgResponseTime.get() as any).avg;
  const lastHour = (stmts.requestsLastHour.get() as any).count;
  const methods = stmts.methodDistribution.all();
  const topPaths = stmts.topPaths.all();

  res.json({
    totalRequests: total,
    avgResponseTime: avg ? Math.round(avg * 100) / 100 : 0,
    requestsLastHour: lastHour,
    methodDistribution: methods,
    topPaths,
  });
});

router.get('/export', (req, res) => {
  const rows = stmts.listAllMocks.all() as any[];
  const data = rows.map((r) => ({
    method: r.method,
    path: r.path,
    response: JSON.parse(r.response),
    delay: r.delay,
    status: r.status,
    headers: JSON.parse(r.headers || '{}'),
    enabled: r.enabled,
  }));

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename=easy-mock-export.json');
  res.json(data);
});

router.post('/import', (req, res) => {
  const { mocks, overwrite } = req.body;

  if (!Array.isArray(mocks)) {
    res.status(400).json({ error: 'mocks array is required' });
    return;
  }

  let imported = 0;
  let skipped = 0;

  const insertMany = db.transaction(() => {
    for (const m of mocks) {
      if (!m.method || !m.path || m.response === undefined) {
        skipped++;
        continue;
      }

      try {
        if (overwrite) {
          db.prepare('DELETE FROM mock_api WHERE path=? AND method=?').run(m.path, m.method);
        }
        stmts.insertMock.run(
          m.method,
          m.path,
          JSON.stringify(m.response),
          m.delay ?? 0,
          m.status ?? 200,
          JSON.stringify(m.headers ?? {})
        );
        imported++;
      } catch {
        skipped++;
      }
    }
  });

  try {
    insertMany();
    res.json({ success: true, imported, skipped });
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Import failed' });
  }
});

router.get('/test', (req, res) => {
  const { path, method } = req.query;

  if (!path || !method) {
    res.status(400).json({ error: 'path and method are required' });
    return;
  }

  const start = Date.now();
  const api = stmts.listAllMocks.all().find(
    (r: any) => r.path === path && r.method === method
  ) as any;

  if (!api) {
    res.status(404).json({ error: 'Not Found' });
    return;
  }

  const duration = Date.now() - start;
  stmts.insertLog.run(method, path, 200, duration, req.ip);

  res.json({
    path,
    method,
    response: JSON.parse(api.response),
    duration,
  });
});

router.get('/logs', (req, res) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const offset = (page - 1) * limit;
  const method = req.query.method as string | undefined;

  let logs: any[];
  let total: number;

  if (method) {
    logs = stmts.listLogsFiltered.all(method, limit, offset);
    total = (stmts.countLogsFiltered.get(method) as any).count;
  } else {
    logs = stmts.listLogs.all(limit, offset);
    total = (stmts.countLogs.get() as any).count;
  }

  res.json({ data: logs, total, page, limit });
});

router.post('/create', (req, res) => {
  const { method, path, response, delay, status, headers } = req.body;

  if (!method || !path || response === undefined) {
    res.status(400).json({ error: 'method, path, and response are required' });
    return;
  }

  if (!['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    res.status(400).json({ error: 'Invalid method. Must be GET, POST, PUT, DELETE, or PATCH' });
    return;
  }

  try {
    stmts.insertMock.run(
      method,
      path,
      JSON.stringify(response),
      delay ?? 0,
      status ?? 200,
      JSON.stringify(headers ?? {})
    );
    res.json({ success: true });
  } catch (e: any) {
    if (e.message?.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: `Mock ${method} ${path} already exists` });
      return;
    }
    res.status(400).json({ error: e.message || 'Failed to create mock' });
  }
});

// ── Parameterized routes (after named routes) ──

router.put('/:id/toggle', (req, res) => {
  const id = req.params.id;
  const row = stmts.getMockById.get(id) as any;
  if (!row) {
    res.status(404).json({ error: 'Mock not found' });
    return;
  }
  stmts.toggleMock.run(row.enabled ? 0 : 1, id);
  res.json({ success: true, enabled: !row.enabled });
});

router.put('/:id', (req, res) => {
  const id = req.params.id;
  const { method, path, response, delay, status, headers, enabled } = req.body;

  if (!method || !path || response === undefined) {
    res.status(400).json({ error: 'method, path, and response are required' });
    return;
  }

  try {
    const result = stmts.updateMock.run(
      method,
      path,
      JSON.stringify(response),
      delay ?? 0,
      status ?? 200,
      JSON.stringify(headers ?? {}),
      enabled ?? 1,
      id
    );

    if (result.changes === 0) {
      res.status(404).json({ error: 'Mock not found' });
      return;
    }

    res.json({ success: true });
  } catch (e: any) {
    if (e.message?.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: `Mock ${method} ${path} already exists` });
      return;
    }
    res.status(400).json({ error: e.message || 'Failed to update mock' });
  }
});

router.get('/:id', (req, res) => {
  const id = req.params.id;
  const row = stmts.getMockById.get(id) as any;

  if (!row) {
    res.status(404).json({ error: 'Mock not found' });
    return;
  }

  res.json({
    ...row,
    response: JSON.parse(row.response),
    headers: JSON.parse(row.headers || '{}'),
  });
});

router.delete('/:id', (req, res) => {
  const id = req.params.id;
  stmts.deleteMock.run(id);
  res.json({ success: true });
});

export default router;
