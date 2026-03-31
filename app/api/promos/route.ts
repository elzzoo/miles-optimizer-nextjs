import { NextResponse } from 'next/server'

export interface Promo {
  id: string
  airline: string
  flag: string
  title: string
  description: string
  validUntil: string
  discount: string
  link: string
}

// Promos curatis à mettre à jour manuellement ou via Travelpayouts
const PROMOS: Promo[] = [
  {
    id: 'af_paris_dakar_2026',
    airline: 'Air France',
    flag: '🇫🇷',
    title: '-30% sur Paris-Dakar',
    description: 'Offre valable jusqu\'au 15 avril',
    validUntil: '15 avril 2026',
    discount: '-30%',
    link: 'https://www.airfrance.sn',
  },
  {
    id: 'tk_miles_bonus_2026',
    airline: 'Turkish Airlines',
    flag: '🇹🇷',
    title: 'Miles bonus x2',
    description: 'Sur tous les vols vers l\'Afrique',
    validUntil: '30 avril 2026',
    discount: 'x2 Miles',
    link: 'https://www.turkishairlines.com',
  },
  {
    id: 'ek_business_2026',
    airline: 'Emirates',
    flag: '🇦🇪',
    title: 'Business Class -40%',
    description: 'Offre limitée — places rares',
    validUntil: '10 avril 2026',
    discount: '-40%',
    link: 'https://www.emirates.com',
  },
]

export async function GET() {
  return NextResponse.json({ promos: PROMOS })
}
