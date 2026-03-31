import { NextRequest, NextResponse } from 'next/server';
import { calculateMilesValue, AIRLINE_MILES_RATES } from '@/lib/miles-calculator';

// Rate limiting store (in-memory, resets on cold start)
const rateLimit = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10');
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW || '60000');
const CACHE_TTL = 6 * 60 * 60; // 6 hours

// Miles requirements by airline and cabin class
const MILES_DATA: Record<string, Record<string, { miles: number; taxes: number }>> = {
  'Air France': {
    economy: { miles: 25000, taxes: 120 },
    business: { miles: 75000, taxes: 250 },
    first: { miles: 150000, taxes: 400 },
  },
  'Turkish Airlines': {
    economy: { miles: 35000, taxes: 80 },
    business: { miles: 70000, taxes: 150 },
    first: { miles: 120000, taxes: 300 },
  },
  'Emirates': {
    economy: { miles: 40000, taxes: 100 },
    business: { miles: 80000, taxes: 200 },
    first: { miles: 160000, taxes: 350 },
  },
  'Qatar Airways': {
    economy: { miles: 32000, taxes: 90 },
    business: { miles: 65000, taxes: 180 },
    first: { miles: 130000, taxes: 320 },
  },
};

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

async function searchKiwiFlights(
  origin: string,
  destination: string,
  departureDate: string,
  cabinClass: string,
  returnDate?: string
) {
  const apiKey = process.env.KIWI_API_KEY;

  if (!apiKey) {
    return null; // Fall back to mock data
  }

  try {
    const dateFrom = departureDate.replace(/-/g, '/');
    const dateTo = dateFrom;

    const params = new URLSearchParams({
      fly_from: origin,
      fly_to: destination,
      date_from: dateFrom,
      date_to: dateTo,
      curr: 'EUR',
      limit: '10',
      sort: 'price',
      cabin_class: cabinClass === 'economy' ? 'M' : cabinClass === 'business' ? 'C' : 'F',
    });

    if (returnDate) {
      const returnFrom = returnDate.replace(/-/g, '/');
      params.append('return_from', returnFrom);
      params.append('return_to', returnFrom);
    }

    const response = await fetch(
      `https://tequila.kiwi.com/v2/search?${params}`,
      {
        headers: {
          'apikey': apiKey,
          'Content-Type': 'application/json',
        },
        next: { revalidate: CACHE_TTL },
      }
    );

    if (!response.ok) {
      throw new Error(`Kiwi API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Kiwi API error:', error);
    return null;
  }
}

function getNextMonthDate(): string {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date.toISOString().split('T')[0];
}

function buildMockResults(origin: string, destination: string, cabinClass: string, currency: string) {
  const mockFlights = [
    {
      id: 'mock_af_001',
      airline: 'Air France',
      iataCode: 'AF',
      price: currency === 'XOF' ? 495000 : currency === 'USD' ? 820 : 750,
      currency,
      departureTime: '10:30',
      arrivalTime: '18:45',
      duration: 375,
      stops: 0,
      isDirect: true,
      origin,
      destination,
      class: cabinClass,
      source: 'fallback',
    },
    {
      id: 'mock_tk_001',
      airline: 'Turkish Airlines',
      iataCode: 'TK',
      price: currency === 'XOF' ? 389000 : currency === 'USD' ? 650 : 590,
      currency,
      departureTime: '22:15',
      arrivalTime: '06:30',
      duration: 615,
      stops: 1,
      isDirect: false,
      origin,
      destination,
      class: cabinClass,
      source: 'fallback',
    },
    {
      id: 'mock_ek_001',
      airline: 'Emirates',
      iataCode: 'EK',
      price: currency === 'XOF' ? 620000 : currency === 'USD' ? 1050 : 950,
      currency,
      departureTime: '14:00',
      arrivalTime: '05:30',
      duration: 810,
      stops: 1,
      isDirect: false,
      origin,
      destination,
      class: cabinClass,
      source: 'fallback',
    },
  ];

  // Scale prices for cabin class
  const multiplier = cabinClass === 'business' ? 2.5 : cabinClass === 'first' ? 5 : 1;
  return mockFlights.map(f => ({ ...f, price: Math.round(f.price * multiplier) }));
}

export async function GET(req: NextRequest) {
  // Rate limiting
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait before searching again.' },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(req.url);
  const origin = searchParams.get('origin') || 'PAR';
  const destination = searchParams.get('destination') || 'DKR';
  const departureDate = searchParams.get('departure') || getNextMonthDate();
  const returnDate = searchParams.get('return') || undefined;
  const cabinClass = searchParams.get('class') || 'economy';
  const currency = searchParams.get('currency') || 'EUR';

  // Validate inputs
  if (!origin || !destination || origin.length < 2 || destination.length < 2) {
    return NextResponse.json(
      { error: 'Invalid origin or destination' },
      { status: 400 }
    );
  }

  const validClasses = ['economy', 'business', 'first'];
  if (!validClasses.includes(cabinClass)) {
    return NextResponse.json(
      { error: 'Invalid cabin class' },
      { status: 400 }
    );
  }

  // Try cache first (Upstash Redis)
  let cachedResult = null;
  let redis = null;
  const cacheKey = `search:${origin}:${destination}:${departureDate}:${cabinClass}:${currency}`;

  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const { Redis } = await import('@upstash/redis');
      redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
      cachedResult = await redis.get(cacheKey);
    } catch (e) {
      console.warn('Redis unavailable, skipping cache');
    }
  }

  if (cachedResult) {
    return NextResponse.json({ ...cachedResult as object, cached: true });
  }

  // Fetch from Kiwi.com
  const kiwiData = await searchKiwiFlights(origin, destination, departureDate, cabinClass, returnDate);

  let flights;

  if (kiwiData && kiwiData.data && kiwiData.data.length > 0) {
    // Process real Kiwi data
    flights = kiwiData.data.slice(0, 10).map((flight: any) => {
      const airline = flight.airlines?.[0] || 'Unknown';
      const price = flight.price;

      // Get miles option for this airline
      const milesInfo = MILES_DATA[airline]?.[cabinClass] ||
        { miles: Math.round(price * 60), taxes: Math.round(price * 0.15) };

      const milesCalc = calculateMilesValue({
        cashPrice: price,
        taxes: milesInfo.taxes,
        milesRequired: milesInfo.miles,
        currency,
        marketMileValue: AIRLINE_MILES_RATES[airline]?.baseValue || 1.0,
      });

      return {
        id: flight.id,
        airline: flight.airlines?.join(', ') || 'Unknown',
        iataCode: flight.airlines?.[0] || 'XX',
        price,
        currency: flight.currency || 'EUR',
        departureTime: new Date(flight.local_departure).toTimeString().slice(0, 5),
        arrivalTime: new Date(flight.local_arrival).toTimeString().slice(0, 5),
        duration: Math.round(flight.duration.total / 60),
        stops: flight.route?.length - 1 || 0,
        isDirect: (flight.route?.length || 1) === 1,
        origin,
        destination,
        class: cabinClass,
        source: 'live',
        milesOption: {
          miles: milesInfo.miles,
          taxes: milesInfo.taxes,
          ...milesCalc,
        },
      };
    });
  } else {
    // Use mock/fallback data
    const mockFlights = buildMockResults(origin, destination, cabinClass, currency);

    flights = mockFlights.map(flight => {
      const milesInfo = MILES_DATA[flight.airline]?.[cabinClass] ||
        { miles: Math.round(flight.price * 60), taxes: Math.round(flight.price * 0.15) };

      const milesCalc = calculateMilesValue({
        cashPrice: flight.price,
        taxes: milesInfo.taxes,
        milesRequired: milesInfo.miles,
        currency,
        marketMileValue: AIRLINE_MILES_RATES[flight.airline]?.baseValue || 1.0,
      });

      return {
        ...flight,
        milesOption: {
          miles: milesInfo.miles,
          taxes: milesInfo.taxes,
          ...milesCalc,
        },
      };
    });
  }

  // Sort by value per mile (best value first)
  flights.sort((a: any, b: any) => b.milesOption.valuePerMile - a.milesOption.valuePerMile);

  const result = {
    flights,
    origin,
    destination,
    departureDate,
    cabinClass,
    currency,
    source: kiwiData ? 'live' : 'fallback',
    cached: false,
  };

  // Cache the result
  if (redis) {
    try {
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
    } catch (e) {
      console.warn('Failed to cache result');
    }
  }

  return NextResponse.json(result);
}
