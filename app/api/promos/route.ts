import { NextResponse } from 'next/server';

interface Promo {
  airline: string;
  title: string;
  description: string;
  link: string;
  icon: string;
}

const FALLBACK_PROMOS: Promo[] = [
  {
    airline: 'Air France',
    title: '-30% sur Paris-Dakar',
    description: "Offre valable jusqu'au 15 avril",
    link: 'https://www.airfrance.sn',
    icon: '🇫🇷',
  },
  {
    airline: 'Turkish Airlines',
    title: 'Miles bonus x2',
    description: 'Sur tous les vols vers l\'Afrique',
    link: 'https://www.turkishairlines.com',
    icon: '🇹🇷',
  },
  {
    airline: 'Emirates',
    title: 'Business Class -40%',
    description: 'Offre limitée — places rares',
    link: 'https://www.emirates.com',
    icon: '🇦🇪',
  },
];

async function fetchPromosFromSerpAPI(): Promise<Promo[]> {
  const apiKey = process.env.SERPAPI_KEY || process.env.NEXT_PUBLIC_SERPAPI_KEY;
  if (!apiKey) throw new Error('Missing SerpAPI key');

  const airlines = [
    { name: 'Air France', query: 'Air France miles promotion Dakar Paris 2025', icon: '🇫🇷', link: 'https://www.airfrance.sn' },
    { name: 'Turkish Airlines', query: 'Turkish Airlines miles bonus Africa promotion 2025', icon: '🇹🇷', link: 'https://www.turkishairlines.com' },
    { name: 'Emirates', query: 'Emirates business class promotion miles 2025', icon: '🇦🇪', link: 'https://www.emirates.com' },
  ];

  const promos: Promo[] = [];

  for (const airline of airlines) {
    try {
      const params = new URLSearchParams({
        api_key: apiKey,
        engine: 'google',
        q: airline.query,
        num: '3',
        hl: 'fr',
        gl: 'sn',
      });

      const response = await fetch(`https://serpapi.com/search?${params.toString()}`, {
        next: { revalidate: 21600 }, // cache for 6 hours
      });

      if (!response.ok) continue;

      const data = await response.json();

      if (data.organic_results && data.organic_results.length > 0) {
        const result = data.organic_results[0];
        promos.push({
          airline: airline.name,
          title: result.title?.substring(0, 40) || `Offre ${airline.name}`,
          description: result.snippet?.substring(0, 80) || 'Voir les offres disponibles',
          link: result.link || airline.link,
          icon: airline.icon,
        });
      }
    } catch (err) {
      console.error(`SerpAPI error for ${airline.name}:`, err);
    }
  }

  return promos.length > 0 ? promos : FALLBACK_PROMOS;
}

export async function GET() {
  try {
    const promos = await fetchPromosFromSerpAPI();
    return NextResponse.json({ promos, source: 'live' });
  } catch (error: any) {
    console.error('Promos fetch error:', error.message);
    return NextResponse.json(
      { promos: FALLBACK_PROMOS, source: 'fallback', error: error.message },
      { status: 200 }
    );
  }
}
