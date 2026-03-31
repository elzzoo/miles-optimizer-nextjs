# Implementation Plan - Production Ready Miles Optimizer

## Current Status
- App: https://miles-optimizer-nextjs.vercel.app/
- API /api/flights: Working with Travelpayouts fallback data
- API /api/promos: Working with SerpAPI data
- UI: Basic dark theme with promo cards

## What Needs To Be Done

### STEP 1: Register Free API Keys
1. **Kiwi.com Tequila API** (FREE): https://tequila.kiwi.com/portal/register
2. **GeoDB Cities API** (FREE): https://rapidapi.com/wirefreethought/api/geodb-cities
3. **Upstash Redis** (FREE 10k/day): https://upstash.com/

### STEP 2: Add Environment Variables in Vercel
Go to: https://vercel.com/elzzoo-6820s-projects/miles-optimizer-nextjs/settings/environment-variables

Add:
```
KIWI_API_KEY=your_key
GEODB_API_KEY=your_key
UPSTASH_REDIS_REST_URL=your_url
UPSTASH_REDIS_REST_TOKEN=your_token
```

### STEP 3: Install Dependencies
Add to package.json:
```json
{
  "dependencies": {
    "@upstash/redis": "^1.28.0",
    "zod": "^3.22.0"
  }
}
```

## New Files To Create

### File 1: app/api/search/route.ts
Main flight search with miles calculator + Redis cache

### File 2: app/api/autocomplete/route.ts
Airport autocomplete with GeoDB Cities API

### File 3: lib/miles-calculator.ts
Pure function for miles value calculation

### File 4: lib/redis.ts
Upstash Redis client wrapper

### File 5: components/search/SearchBar.tsx
New Google Flights style search bar

### File 6: components/results/FlightCard.tsx
Modern flight result card with miles comparison

### File 7: components/results/MilesValueMeter.tsx
Visual meter: BAD -> OK -> GREAT

### File 8: app/page.tsx (REPLACE)
New hero + default Paris->Dakar search

## Miles Calculator Formula

value_per_mile = (cash_price - taxes) / miles_required
Result displayed in CENTS

Example:
- Cash: 520 EUR
- Miles: 35,000 + 120 EUR taxes
- Value = (520 - 120) / 35000 * 100 = 1.14 cents

Rules:
- < 1 cent = BAD
- 1.0 - 1.5 cents = OK
- > 2.0 cents = GREAT

## Color Palette
```
primary: #0ea5e9  (sky-500)
secondary: #6366f1 (indigo-500)
background: #0f172a (slate-900)
cards: #1e293b (slate-800)
```

## Default Search Values
```
Origin: Paris (CDG)
Destination: Dakar (DKR)
Date: Next month
Class: Economy
Type: One way
```

## Security Rules
- NEVER expose API keys in frontend
- ALL external API calls in /api routes (server-side)
- Validate all inputs with Zod
- Rate limit: 10 req/min per IP
