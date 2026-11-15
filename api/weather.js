// Vercel serverless function: GET /api/weather?q=<city>
// Proxies WeatherAPI.com so the API key never reaches the browser (PRD: NFR "API key safety").

const UPSTREAM = 'https://api.weatherapi.com/v1/current.json';
const TIMEOUT_MS = 8000;

export default async function handler(req, res) {
  const q = String(req.query?.q ?? '').trim().slice(0, 100);

  if (!q) {
    return res.status(400).json({ error: { code: 'EMPTY_QUERY', message: 'Missing city name.' } });
  }

  const key = process.env.WEATHERAPI_KEY;
  if (!key) {
    return res.status(500).json({ error: { code: 'NO_KEY', message: 'Server is missing WEATHERAPI_KEY.' } });
  }

  const url = `${UPSTREAM}?key=${encodeURIComponent(key)}&q=${encodeURIComponent(q)}&aqi=no`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

  try {
    const upstream = await fetch(url, { signal: ctrl.signal });
    const body = await upstream.json().catch(() => null);

    // WeatherAPI error 1006 = "No matching location found."
    if (body?.error?.code === 1006) {
      res.setHeader('Cache-Control', 'public, s-maxage=600');
      return res.status(404).json({ error: { code: 1006, message: 'No matching location found.' } });
    }

    if (!upstream.ok || !body || body.error) {
      // Quota exceeded, invalid key, 5xx etc. Don't cache failures.
      res.setHeader('Cache-Control', 'no-store');
      return res.status(502).json({
        error: { code: body?.error?.code ?? upstream.status, message: 'Weather service unavailable.' },
      });
    }

    // Cache each city's response for 10 minutes at the edge (PRD: NFR "Caching").
    res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=300');
    return res.status(200).json(body);
  } catch (err) {
    res.setHeader('Cache-Control', 'no-store');
    const timedOut = err?.name === 'AbortError';
    return res.status(timedOut ? 504 : 502).json({
      error: { code: timedOut ? 'TIMEOUT' : 'UPSTREAM', message: 'Weather service unavailable.' },
    });
  } finally {
    clearTimeout(timer);
  }
}
