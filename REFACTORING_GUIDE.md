# Miles Optimizer - Production Refactoring Guide

## 🎯 Objective
Transform Miles Optimizer into a production-ready travel comparison SaaS platform.

## 📋 Technical Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: React hooks + Server Components

### Backend
- **API Routes**: Next.js API routes (Edge Runtime)
- **Caching**: Upstash Redis (free tier)
- **Rate Limiting**: Upstash Redis

### External APIs (FREE ONLY)
1. **Kiwi.com Tequila API** - Flight search
2. **GeoDB Cities API** - Airport autocomplete
3. **Travelpayouts API** - Flight deals
4. **OpenWeather API** (optional) - Weather data

## 🏗️ New Architecture

### API Routes Structure
```
app/api/
├── search/route.ts          # Main flight search + miles calculation
├── autocomplete/route.ts    # Airport/city autocomplete
├── deals/route.ts           # Flight deals from Travelpayouts
└── cache/route.ts           # Cache management endpoint
```

### Core Algorithm: Miles Value Calculator

```typescript
interface MilesCalculation {
  valuePerMile: number;  // in cents
  recommendation: 'BAD' | 'OK' | 'GREAT';
  savings: number;
}

function calculateMilesValue(
  cashPrice: number,
  taxes: number,
  milesRequired: number
): MilesCalculation {
  const valuePerMile = ((cashPrice - taxes) / milesRequired) * 100;
  
  let recommendation: 'BAD' | 'OK' | 'GREAT';
  if (valuePerMile < 1) recommendation = 'BAD';
  else if (valuePerMile <= 1.5) recommendation = 'OK';
  else recommendation = 'GREAT';
  
  const milesCost = milesRequired * 0.01; // assume 1 cent per mile
  const savings = cashPrice - (milesCost + taxes);
  
  return { valuePerMile, recommendation, savings };
}
```

## 🎨 UI Design System

### Color Palette
```css
--primary: #0ea5e9;      /* Sky blue */
--secondary: #6366f1;    /* Indigo */
--background: #0f172a;   /* Dark navy */
--card-bg: #1e293b;      /* Slate 800 */
--text-primary: #f8fafc; /* White */
--text-secondary: #94a3b8; /* Gray */
--success: #10b981;      /* Green */
--warning: #f59e0b;      /* Amber */
--danger: #ef4444;       /* Red */
```

### Component Structure
```
components/
├── search/
│   ├── SearchBar.tsx
│   ├── AirportAutocomplete.tsx
│   ├── DatePicker.tsx
│   └── ClassSelector.tsx
├── results/
│   ├── FlightCard.tsx
│   ├── MilesValueMeter.tsx
│   ├── RecommendationBadge.tsx
│   └── ResultsGrid.tsx
├── deals/
│   ├── DealsSection.tsx
│   └── DealCard.tsx
└── layout/
    ├── Hero.tsx
    ├── Nav.tsx
    └── Footer.tsx
```

## 🔐 Security Implementation

### Environment Variables (.env.local)
```env
# Kiwi.com API
KIWI_API_KEY=your_key_here

# GeoDB Cities API
GEODB_API_KEY=your_key_here

# Travelpayouts API
TRAVELPAYOUTS_API_KEY=your_key_here

# Upstash Redis
UPSTASH_REDIS_REST_URL=your_url_here
UPSTASH_REDIS_REST_TOKEN=your_token_here

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=10
RATE_LIMIT_WINDOW=60000
```

### Security Checklist
- ✅ All API keys in environment variables
- ✅ Server-side API calls only (no client exposure)
- ✅ Input validation with Zod
- ✅ Rate limiting per IP
- ✅ Error handling without data leakage
- ✅ CORS headers properly configured

## 📱 Core Features Implementation

### 1. Default Search (Paris → Dakar)
- Auto-load on homepage
- Economy class
- Next month departure
- Shows example results immediately

### 2. Flight Search Flow
1. User enters origin/destination (autocomplete)
2. Selects dates & class
3. API fetches from Kiwi.com
4. Calculate miles value for each option
5. Display sorted results with recommendations

### 3. Results Display
Each flight card shows:
- Airline logo
- Flight details (times, duration, stops)
- **Cash price**
- **Miles option** (miles + taxes)
- **Value per mile** (highlighted)
- **Recommendation badge**
- Visual meter: BAD ——— OK ——— GREAT

### 4. Deals Section
- Fetch top deals from Travelpayouts
- Display as horizontal carousel
- "See Deal" CTA to booking site

## ⚡ Performance Optimization

### Caching Strategy (Redis)
```typescript
const CACHE_TTL = 6 * 60 * 60; // 6 hours

const cacheKey = `flight:${origin}:${destination}:${date}:${class}`;

// Check cache first
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

// Fetch from API
const results = await fetchFromKiwi();

// Cache results
await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(results));
```

### Bundle Optimization
- Dynamic imports for heavy components
- Image optimization with next/image
- Font optimization
- Tree-shaking unused code

## 🚀 Deployment (Vercel Free Tier)

### Setup Steps
1. Connect GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Configure build settings:
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. Deploy!

### Post-Deployment
- Test all API endpoints
- Verify caching works
- Check rate limiting
- Monitor performance

## 📊 API Endpoints Documentation

### POST /api/search
Search for flights with miles calculation.

**Request:**
```json
{
  "origin": "PAR",
  "destination": "DKR",
  "departureDate": "2026-05-01",
  "returnDate": "2026-05-15",
  "cabinClass": "economy",
  "tripType": "roundtrip"
}
```

**Response:**
```json
{
  "flights": [
    {
      "id": "xyz",
      "airline": "Air France",
      "price": 520,
      "currency": "EUR",
      "milesOption": {
        "miles": 35000,
        "taxes": 120,
        "valuePerMile": 1.14,
        "recommendation": "OK"
      },
      "departure": "2026-05-01T10:00:00Z",
      "arrival": "2026-05-01T16:30:00Z",
      "duration": 390,
      "stops": 0
    }
  ],
  "cached": false
}
```

### GET /api/autocomplete?q={query}
Autocomplete airports/cities.

**Response:**
```json
{
  "results": [
    {
      "code": "CDG",
      "name": "Paris Charles de Gaulle",
      "city": "Paris",
      "country": "France"
    }
  ]
}
```

### GET /api/deals
Get current flight deals.

**Response:**
```json
{
  "deals": [
    {
      "origin": "PAR",
      "destination": "NYC",
      "price": 299,
      "currency": "EUR",
      "link": "https://..."
    }
  ]
}
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Homepage loads with Paris→Dakar search
- [ ] Autocomplete suggests airports
- [ ] Search returns results
- [ ] Miles value calculated correctly
- [ ] Recommendations show correct badges
- [ ] Deals section displays
- [ ] Responsive on mobile
- [ ] API rate limiting works
- [ ] Caching reduces API calls

## 📝 Migration Steps

### Phase 1: API Setup (Priority)
1. Create `/api/search/route.ts` with Kiwi.com integration
2. Implement miles calculator
3. Add Upstash Redis caching
4. Create `/api/autocomplete/route.ts` with GeoDB
5. Create `/api/deals/route.ts` with Travelpayouts

### Phase 2: UI Refactoring
1. Update color scheme
2. Create new Hero component
3. Build SearchBar with autocomplete
4. Design FlightCard component
5. Add MilesValueMeter visualization
6. Create Deals section

### Phase 3: Integration
1. Connect UI to new APIs
2. Implement default Paris→Dakar search
3. Add loading states
4. Error handling UI

### Phase 4: Polish
1. Add animations
2. Mobile optimization
3. SEO meta tags
4. Performance testing
5. Documentation

## 🎯 Success Metrics
- ✅ Build succeeds on Vercel
- ✅ API response time < 2s
- ✅ Cache hit rate > 60%
- ✅ Lighthouse score > 90
- ✅ Mobile responsive
- ✅ Zero security vulnerabilities

## 🔗 Useful Resources
- [Kiwi.com API Docs](https://tequila.kiwi.com/docs/tequila_api/)
- [GeoDB Cities API](https://rapidapi.com/wirefreethought/api/geodb-cities)
- [Travelpayouts API](https://www.travelpayouts.com/)
- [Upstash Redis](https://upstash.com/)
- [Next.js Edge Runtime](https://nextjs.org/docs/app/api-reference/edge)

---

**Last Updated**: March 31, 2026
**Status**: Ready for implementation 🚀
