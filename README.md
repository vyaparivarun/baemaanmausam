# BaeMaan Mausam

Check the sky's credit score before you step out. A one-screen live weather app built to the SKYCRED PRD, renamed BaeMaan Mausam. Live at https://baemaan-mausam.vercel.app (Nov 15, 2026).

## Structure

```
index.html        Static single-page app (HTML + CSS + JS in one file)
api/weather.js    Vercel serverless proxy to WeatherAPI.com (key stays server-side, 10-min edge cache)
dev/              Local dev server + mock data (not deployed)
```

## Run locally

```bash
npm run dev:mock                     # no key needed, mock data
WEATHERAPI_KEY=xxxx npm run dev      # live data
# open http://localhost:3000
```

Mock mode extras: search `nowhere` → not-found state, `fail` → network-error state with Retry. Also try `oslo` (Snow Day) and `dubai` (Heat Wave + UV add-on).

## Deploy to Vercel

1. Push this folder to a Git repo and import it in Vercel (or run `vercel` in this folder). No build step and no framework preset ("Other").
2. Add the environment variable `WEATHERAPI_KEY` in Project → Settings → Environment Variables.
3. Optional: enable Web Analytics in the Vercel dashboard. The page already sends `search`, `chip_tap`, `copy_json`, `not_found` and `error` events. Custom events need a Vercel Pro plan.

## PRD coverage

- FR-1 to FR-13: all implemented.
- UX states: loading, success, not found (1006), network/API failure with Retry, empty input (ignored, keeps focus).
- From v1.1: condition-first mood logic (fixes "Warm & Sunny" showing under "Smoky haze"), error state with Retry, server-side API key.
- NFRs: key never sent to the browser; `s-maxage=600` edge caching per city (queries are lowercased so "Mumbai" and "mumbai" share one cache entry); 600 px single column; chips are `aria-pressed` toggle buttons; results in an `aria-live` region; keyboard-reachable tabs; respects reduced motion.

Not included (later roadmap): °C/°F toggle, remember last city, per-IP rate limiting, Sky Score.
