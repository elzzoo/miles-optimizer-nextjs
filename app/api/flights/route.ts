import { NextRequest, NextResponse } from 'next/server';

const MILES_PRICES: Record<string, { base: number; promo?: number; currency: string }> = {
  'Air France': { base: 0.027, promo: 0.0169, currency: 'EUR' },
  'Turkish Airlines': { base: 0.030, currency: 'USD' },
  'Emirates': { base: 0.030, promo: 0.021, currency: 'USD' },
  'Qatar Airways': { base: 0.035, promo: 0.022, currency: 'USD' },
};

const EXCHANGE_RATES: Record<string, number> = {
  EUR_XOF: 655.957,
  USD_XOF: 610.0,
  EUR_USD: 1.08,
  USD_EUR: 0.92,
  XOF_EUR: 1 / 655.957,
  XOF_USD: 1 / 610.0,
};

function convertCurrency(amount: number, from: string, to: string): number {
  if (from === to) return amount;
  const key = `${from}_${to}`;
  if (EXCHANGE_RATES[key]) return amount * EXCHANGE_RATES[key];
  const invKey = `${to}_${from}`;
  if (EXCHANGE_RATES[invKey]) return amount / EXCHANGE_RATES[invKey];
  return amount;
}

async function fetchTravelpayoutsFlights(
  origin: string,
  destination: string,
  departureDate: string,
  returnDate: string | null,
  travelClass: string,
  currency: string
) {
  const token = process.env.TRAVELPAYOUTS_TOKEN || process.env.NEXT_PUBLIC_TRAVELPAYOUTS_TOKEN;
  if (!token) throw new Error('Missing Travelpayouts API token');

  // Travelpayouts Aviasales prices API
  const originCode = origin.split(' - ')[0]?.trim() || origin;
  const destCode = destination.split(' - ')[0]?.trim() || destination;

  // Use the cheapest tickets API endpoint
  const params = new URLSearchParams({
    origin: originCode,
    destination: destCode,
    currency: currency === 'XOF' ? 'EUR' : currency.toLowerCase(),
    token,
    limit: '10',
    one_way: returnDate ? '0' : '1',
  });

  if (departureDate) {
    // Format: YYYY-MM
    const dateParts = departureDate.split('-');
    if (dateParts.length === 3) {
      params.set('depart_date', `${dateParts[0]}-${dateParts[1]}`);
    }
  }

  if (returnDate) {
    const dateParts = returnDate.split('-');
    if (dateParts.length === 3) {
      params.set('return_date', `${dateParts[0]}-${dateParts[1]}`);
    }
  }

  const url = `https://api.travelpayouts.com/v1/prices/cheap?${params.toString()}`;

  const response = await fetch(url, {
    headers: {
      'X-Access-Token': token,
      'Accept-Encoding': 'gzip, deflate, sdch',
    },
    next: { revalidate: 3600 }, // cache for 1 hour
  });

  if (!response.ok) {
    throw new Error(`Travelpayouts API error: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get('origin') || '';
  const destination = searchParams.get('destination') || '';
  const departureDate = searchParams.get('departureDate') || '';
  const returnDate = searchParams.get('returnDate') || null;
  const travelClass = searchParams.get('class') || 'economy';
  const currency = searchParams.get('currency') || 'XOF';

  if (!origin || !destination) {
    return NextResponse.json({ error: 'Origin and destination required' }, { status: 400 });
  }

  try {
    const apiData = await fetchTravelpayoutsFlights(
      origin,
      destination,
      departureDate,
      returnDate,
      travelClass,
      currency
    );

    const multiplier = travelClass === 'business' ? 2.5 : travelClass === 'first' ? 5 : 1;
    const milesMult = travelClass === 'business' ? 3 : travelClass === 'first' ? 6 : 1;

    const results: any[] = [];
    const apiCurrency = currency === 'XOF' ? 'EUR' : currency;

    // Parse Travelpayouts response format: { data: { "DEST": { "0": { price, airline, ... } } } }
    if (apiData?.data) {
      const destData = apiData.data[destination.split(' - ')[0]?.trim()] || {};
      const airlineMap: Record<string, any> = {};

      // Aggregate cheapest price per airline
      for (const key of Object.keys(destData)) {
        const ticket = destData[key];
        const airlineCode = ticket.airline;
        if (!airlineMap[airlineCode] || ticket.price < airlineMap[airlineCode].price) {
          airlineMap[airlineCode] = ticket;
        }
      }

      // Map IATA codes to airline names
      const airlineNames: Record<string, string> = {
        AF: 'Air France',
        TK: 'Turkish Airlines',
        EK: 'Emirates',
        QR: 'Qatar Airways',
      };

      for (const [code, ticket] of Object.entries(airlineMap)) {
        const airlineName = airlineNames[code] || code;
        const pricing = MILES_PRICES[airlineName] || { base: 0.03, currency: 'USD' };
        const pricePerMile = pricing.promo || pricing.base;
        const milesRequired = Math.round((ticket.number_of_changes === 0 ? 25000 : 35000) * milesMult);
        const cashPriceInApiCurrency = ticket.price * multiplier;
        const cashPrice = convertCurrency(cashPriceInApiCurrency, apiCurrency, currency);
        const milesPriceInApiCurrency = convertCurrency(pricePerMile, pricing.currency, apiCurrency);
        const milesPriceInTarget = convertCurrency(pricePerMile, pricing.currency, currency);

        results.push({
          airline: airlineName,
          cashPrice: Math.round(cashPrice),
          milesRequired,
          currency,
          departureTime: ticket.departure_at ? ticket.departure_at.substring(11, 16) : '--:--',
          arrivalTime: '--:--',
          duration: ticket.duration ? `${Math.floor(ticket.duration / 60)}h ${ticket.duration % 60}m` : 'N/A',
          isDirect: ticket.number_of_changes === 0,
          class: travelClass,
          bookingUrl: ticket.link
            ? `https://www.aviasales.com${ticket.link}`
            : `https://www.airfrance.sn`,
          milesPriceUsed: milesPriceInTarget,
          isPromoApplied: !!pricing.promo,
          source: 'live',
        });
      }
    }

    // Fallback: if no live results, use calibrated estimates
    if (results.length === 0) {
      const airlines = ['Air France', 'Turkish Airlines'];
      for (const name of airlines) {
        const pricing = MILES_PRICES[name] || { base: 0.03, currency: 'USD' };
        const pricePerMile = pricing.promo || pricing.base;
        const milesPriceInTarget = convertCurrency(pricePerMile, pricing.currency, currency);
        const baseCash = name === 'Air France'
          ? convertCurrency(750, 'EUR', currency)
          : convertCurrency(590, 'USD', currency);

        results.push({
          airline: name,
          cashPrice: Math.round(baseCash * multiplier),
          milesRequired: (name === 'Air France' ? 25000 : 35000) * milesMult,
          currency,
          departureTime: name === 'Air France' ? '10:30' : '22:15',
          arrivalTime: name === 'Air France' ? '18:45' : '06:30',
          duration: name === 'Air France' ? '6h 15m' : '8h 15m',
          isDirect: name === 'Air France',
          class: travelClass,
          bookingUrl: name === 'Air France' ? 'https://www.airfrance.sn' : 'https://www.turkishairlines.com',
          milesPriceUsed: milesPriceInTarget,
          isPromoApplied: !!pricing.promo,
          source: 'estimated',
        });
      }
    }

    return NextResponse.json({ results, source: results[0]?.source || 'none' });
  } catch (error: any) {
    console.error('Flight search error:', error.message);

    // Return fallback data on error
    const multiplier = travelClass === 'business' ? 2.5 : travelClass === 'first' ? 5 : 1;
    const milesMult = travelClass === 'business' ? 3 : travelClass === 'first' ? 6 : 1;
    const airlines = ['Air France', 'Turkish Airlines'];
    const results = airlines.map((name) => {
      const pricing = MILES_PRICES[name] || { base: 0.03, currency: 'USD' };
      const pricePerMile = pricing.promo || pricing.base;
      const milesPriceInTarget = convertCurrency(pricePerMile, pricing.currency, currency);
      const baseCash = name === 'Air France'
        ? convertCurrency(750, 'EUR', currency)
        : convertCurrency(590, 'USD', currency);

      return {
        airline: name,
        cashPrice: Math.round(baseCash * multiplier),
        milesRequired: (name === 'Air France' ? 25000 : 35000) * milesMult,
        currency,
        departureTime: name === 'Air France' ? '10:30' : '22:15',
        arrivalTime: name === 'Air France' ? '18:45' : '06:30',
        duration: name === 'Air France' ? '6h 15m' : '8h 15m',
        isDirect: name === 'Air France',
        class: travelClass,
        bookingUrl: name === 'Air France' ? 'https://www.airfrance.sn' : 'https://www.turkishairlines.com',
        milesPriceUsed: milesPriceInTarget,
        isPromoApplied: !!pricing.promo,
        source: 'fallback',
      };
    });

    return NextResponse.json(
      { results, source: 'fallback', error: error.message },
      { status: 200 } // Return 200 with fallback data so UI still works
    );
  }
}
