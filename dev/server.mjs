// Local dev server: `npm run dev`
// - With WEATHERAPI_KEY set, /api/weather calls the real serverless handler.
// - Without it (or with MOCK=1), /api/weather serves mock data so the UI can be explored offline.
//   Mock extras: q=nowhere -> 404 not found, q=fail -> 502 network error.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import handler from '../api/weather.js';
import { mock } from './mock-data.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT || 3000);
const useMock = process.env.MOCK === '1' || !process.env.WEATHERAPI_KEY;

function shimRes(res) {
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (o) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(o)); return res; };
  return res;
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  shimRes(res);

  if (url.pathname === '/api/weather') {
    req.query = Object.fromEntries(url.searchParams);
    if (!useMock) return handler(req, res);
    const q = (req.query.q || '').trim().toLowerCase();
    await new Promise((r) => setTimeout(r, 400));
    if (q === 'fail') return res.status(502).json({ error: { code: 'UPSTREAM', message: 'Weather service unavailable.' } });
    const data = mock(q);
    if (!data) return res.status(404).json({ error: { code: 1006, message: 'No matching location found.' } });
    return res.status(200).json(data);
  }

  if (url.pathname === '/' || url.pathname === '/index.html') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.end(await readFile(path.join(root, 'index.html')));
  }
  res.statusCode = 404; res.end('Not found');
}).listen(PORT, () => {
  console.log(`SKYCRED on http://localhost:${PORT}  (${useMock ? 'MOCK data' : 'live WeatherAPI'})`);
});
