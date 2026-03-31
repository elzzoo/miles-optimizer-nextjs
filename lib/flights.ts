// Types
export interface Flight {
  id: string
  airline: string
  iataCode: string
  price: number
  currency: string
  departureTime: string
  arrivalTime: string
  duration: number       // en minutes
  stops: number
  isDirect: boolean
  origin: string
  destination: string
  cabinClass: string
  source: 'live' | 'fallback'
}

export interface SearchParams {
  from: string
  to: string
  date: string
  returnDate?: string
  cabinClass: string
  currency: string
}

// Miles requis par compagnie/classe (données de marché)
export const MILES_REQUIREMENTS: Record<string, Record<string, { miles: number; taxes: number }>> = {
  'Air France': {
    economy:  { miles: 25000, taxes: 120 },
    business: { miles: 75000, taxes: 250 },
    first:    { miles: 150000, taxes: 400 },
  },
  'Turkish Airlines': {
    economy:  { miles: 35000, taxes: 80 },
    business: { miles: 70000, taxes: 150 },
    first:    { miles: 120000, taxes: 300 },
  },
  'Emirates': {
    economy:  { miles: 40000, taxes: 100 },
    business: { miles: 80000, taxes: 200 },
    first:    { miles: 160000, taxes: 350 },
  },
  'Qatar Airways': {
    economy:  { miles: 32000, taxes: 90 },
    business: { miles: 65000, taxes: 180 },
    first:    { miles: 130000, taxes: 320 },
  },
}

// Données de fallback (quand Tequila API n'est pas disponible)
export function getMockFlights(params: SearchParams): Flight[] {
  const { from, to, currency, cabinClass } = params
  const multiplier = cabinClass === 'business' ? 2.8 : cabinClass === 'first' ? 5.5 : 1

  const base = [
    {
      id: 'mock_af_001',
      airline: 'Air France',
      iataCode: 'AF',
      price: currency === 'XOF' ? 495000 : currency === 'USD' ? 820 : 750,
      departureTime: '10:30',
      arrivalTime: '18:45',
      duration: 375,
      stops: 0,
      isDirect: true,
    },
    {
      id: 'mock_tk_001',
      airline: 'Turkish Airlines',
      iataCode: 'TK',
      price: currency === 'XOF' ? 389000 : currency === 'USD' ? 650 : 590,
      departureTime: '22:15',
      arrivalTime: '06:30',
      duration: 615,
      stops: 1,
      isDirect: false,
    },
    {
      id: 'mock_ek_001',
      airline: 'Emirates',
      iataCode: 'EK',
      price: currency === 'XOF' ? 620000 : currency === 'USD' ? 1050 : 950,
      departureTime: '14:00',
      arrivalTime: '05:30',
      duration: 810,
      stops: 1,
      isDirect: false,
    },
    {
      id: 'mock_qr_001',
      airline: 'Qatar Airways',
      iataCode: 'QR',
      price: currency === 'XOF' ? 420000 : currency === 'USD' ? 710 : 650,
      departureTime: '08:45',
      arrivalTime: '19:20',
      duration: 510,
      stops: 1,
      isDirect: false,
    },
  ]

  return base.map(f => ({
    ...f,
    price: Math.round(f.price * multiplier),
    currency,
    origin: from,
    destination: to,
    cabinClass,
    source: 'fallback' as const,
  }))
}

// Appel client-side vers l'API route
export async function searchFlights(params: SearchParams): Promise<Flight[]> {
  const query = new URLSearchParams({
    from: params.from,
    to: params.to,
    date: params.date,
    class: params.cabinClass,
    currency: params.currency,
    ...(params.returnDate ? { return: params.returnDate } : {}),
  })
  const res = await fetch(`/api/flights?${query}`)
  if (!res.ok) throw new Error('Erreur réseau')
  const data = await res.json()
  return data.flights ?? []
}
