import { NextRequest, NextResponse } from 'next/server'
import { getMockFlights, MILES_REQUIREMENTS, type Flight } from '@/lib/flights'
import { analyzeMiles } from '@/lib/miles'
import { cacheGet, cacheSet } from '@/lib/redis'

const CACHE_TTL = 3600  // 1h
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '20')
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW || '60000')

// Rate limit store in-memory
const rateStore = new Map<string, { count: number; reset: number }>()

function checkRate(ip: string): boolean {
  const now = Date.now()
  const entry = rateStore.get(ip)
  if (!entry || now > entry.reset) {
    rateStore.set(ip, { count: 1, reset: now + RATE_LIMIT_WINDOW })
    return true
  }
  if (entry.count >= RATE_LIMIT_MAX) return false
  entry.count++
  return true
}

interface TequilaFlight {
  id: string
  price: number
  currency: string
  airlines: string[]
  local_departure: string
  local_arrival: string
  duration: { total: number }
  route: unknown[]
  cityFrom: string
  cityTo: string
}

async function fetchTequila(
  from: string, to: string, date: string,
  cabinClass: string, returnDate?: string
): Promise<TequilaFlight[] | null> {
  const apiKey = process.env.TEQUILA_API_KEY
  if (!apiKey) return null

  try {
    const d = date.replace(/-/g, '/')
    const params = new URLSearchParams({
      fly_from: from, fly_to: to,
      date_from: d, date_to: d,
      curr: 'EUR', limit: '10', sort: 'price',
      selected_cabins: cabinClass === 'economy' ? 'M' : cabinClass === 'business' ? 'C' : 'F',
    })
    if (returnDate) {
      const r = returnDate.replace(/-/g, '/')
      params.set('return_from', r)
      params.set('return_to', r)
    }

    const res = await fetch(`https://tequila.kiwi.com/v2/search?${params}`, {
      headers: { apikey: apiKey },
      next: { revalidate: CACHE_TTL },
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.data ?? null
  } catch {
    return null
  }
}

function enrichWithMiles(flights: Flight[], cabinClass: string, currency: string) {
  return flights.map(flight => {
    const req = MILES_REQUIREMENTS[flight.airline]?.[cabinClass]
      ?? { miles: Math.round(flight.price * 55), taxes: Math.round(flight.price * 0.15) }
    const analysis = analyzeMiles(flight.price, req.taxes, req.miles, flight.airline, currency)
    return { ...flight, miles: req.miles, taxes: req.taxes, analysis }
  })
}

export async function GET(req: NextRequest) {
  // Rate limit
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
  if (!checkRate(ip)) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Attendez avant de chercher encore.' },
      { status: 429 }
    )
  }

  const sp = new URL(req.url).searchParams
  const from       = (sp.get('from') ?? '').toUpperCase()
  const to         = (sp.get('to') ?? '').toUpperCase()
  const date       = sp.get('date') ?? new Date(Date.now() + 30*86400000).toISOString().slice(0,10)
  const returnDate = sp.get('return') ?? undefined
  const cabinClass = sp.get('class') ?? 'economy'
  const currency   = sp.get('currency') ?? 'EUR'

  if (!from || !to) {
    return NextResponse.json({ error: 'Origine et destination requis' }, { status: 400 })
  }

  // Cache
  const cacheKey = `flights:${from}:${to}:${date}:${cabinClass}:${currency}`
  const cached = await cacheGet<object>(cacheKey)
  if (cached) return NextResponse.json({ ...cached, cached: true })

  // Tequila API
  const rawFlights = await fetchTequila(from, to, date, cabinClass, returnDate)
  let flights: Flight[]
  let source: 'live' | 'fallback'

  if (rawFlights && rawFlights.length > 0) {
    source = 'live'
    flights = rawFlights.slice(0, 10).map(f => ({
      id: f.id,
      airline: f.airlines?.[0] ?? 'Unknown',
      iataCode: f.airlines?.[0] ?? 'XX',
      price: f.price,
      currency: f.currency ?? 'EUR',
      departureTime: new Date(f.local_departure).toTimeString().slice(0, 5),
      arrivalTime: new Date(f.local_arrival).toTimeString().slice(0, 5),
      duration: Math.round(f.duration.total / 60),
      stops: Math.max(0, (f.route?.length ?? 1) - 1),
      isDirect: (f.route?.length ?? 1) === 1,
      origin: from,
      destination: to,
      cabinClass,
      source: 'live' as const,
    }))
  } else {
    source = 'fallback'
    flights = getMockFlights({ from, to, date, cabinClass, currency })
  }

  const enriched = enrichWithMiles(flights, cabinClass, currency)
  // Tri: meilleure valeur par mile en premier
  enriched.sort((a, b) => b.analysis.valuePerMile - a.analysis.valuePerMile)

  const result = { flights: enriched, from, to, date, cabinClass, currency, source, cached: false }
  await cacheSet(cacheKey, result, CACHE_TTL)

  return NextResponse.json(result)
}
