'use client';
import { useState, useRef, useEffect } from 'react';
import { searchAirports, type Airport } from '@/lib/airports';
import FlightCard from '@/components/FlightCard';
import type { Flight } from '@/lib/flights';
import type { MilesResult } from '@/lib/miles';

type TravelClass = 'economy' | 'business' | 'first';
type TripType = 'one-way' | 'round-trip';

type EnrichedFlight = Flight & { miles: number; taxes: number; analysis: MilesResult };

interface ApiResponse {
  flights: EnrichedFlight[];
  from: string;
  to: string;
  date: string;
  cabinClass: string;
  currency: string;
  source: 'live' | 'fallback';
  cached: boolean;
  error?: string;
}

export default function SearchForm() {
  const [tripType, setTripType] = useState<TripType>('one-way');
  const [travelClass, setTravelClass] = useState<TravelClass>('economy');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [originCode, setOriginCode] = useState('');
  const [destinationCode, setDestinationCode] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [currency, setCurrency] = useState('XOF');
  const [originResults, setOriginResults] = useState<Airport[]>([]);
  const [destinationResults, setDestinationResults] = useState<Airport[]>([]);
  const [showOriginResults, setShowOriginResults] = useState(false);
  const [showDestResults, setShowDestResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const originRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (originRef.current && !originRef.current.contains(event.target as Node)) setShowOriginResults(false);
      if (destRef.current && !destRef.current.contains(event.target as Node)) setShowDestResults(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originCode || !destinationCode) {
      setError('Veuillez sélectionner origine et destination depuis la liste.');
      return;
    }
    setLoading(true);
    setApiData(null);
    setError(null);
    try {
      const params = new URLSearchParams({
        from: originCode,
        to: destinationCode,
        date: departureDate,
        class: travelClass,
        currency,
      });
      if (tripType === 'round-trip' && returnDate) params.set('return', returnDate);
      const res = await fetch(`/api/flights?${params}`);
      const data: ApiResponse = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur lors de la recherche.');
      } else {
        setApiData(data);
      }
    } catch {
      setError('Erreur réseau. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="glass rounded-3xl p-6 space-y-5">
        <div className="flex flex-wrap gap-3 justify-between">
          <div className="flex gap-2">
            {(['one-way', 'round-trip'] as TripType[]).map((type) => (
              <button key={type} type="button" onClick={() => setTripType(type)}
                className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                  tripType === type ? 'bg-navy-600 text-white shadow-lg' : 'text-white/40 hover:text-white/70'
                }`}>
                {type === 'one-way' ? 'Aller Simple' : 'Aller-Retour'}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {(['economy', 'business', 'first'] as TravelClass[]).map((cls) => (
              <button key={cls} type="button" onClick={() => setTravelClass(cls)}
                className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                  travelClass === cls ? 'bg-blue-600 text-white shadow-lg' : 'text-white/40 hover:text-white/70'
                }`}>
                {cls === 'economy' ? 'Éco' : cls === 'business' ? 'Business' : 'First'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative" ref={originRef}>
            <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-1.5">Origine</label>
            <input type="text" value={origin}
              onChange={(e) => {
                setOrigin(e.target.value);
                setOriginCode('');
                if (e.target.value.length >= 2) { setOriginResults(searchAirports(e.target.value)); setShowOriginResults(true); }
              }}
              placeholder="D’où partez-vous ?" required
              className="w-full bg-navy-900/50 border border-white/10 rounded-2xl px-5 py-3.5 text-white placeholder:text-white/20 focus:outline-none focus:border-navy-500 transition-all" />
            {showOriginResults && originResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 bg-navy-800 border border-white/10 rounded-2xl mt-1 overflow-hidden shadow-2xl">
                {originResults.slice(0, 6).map((a) => (
                  <button key={a.code} type="button" onClick={() => { setOrigin(`${a.code} – ${a.city}`); setOriginCode(a.code); setShowOriginResults(false); }}
                    className="w-full px-5 py-3 text-left hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors">
                    <span className="text-white font-bold text-sm">{a.code} – {a.city}</span>
                    <span className="block text-white/40 text-xs">{a.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative" ref={destRef}>
            <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-1.5">Destination</label>
            <input type="text" value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                setDestinationCode('');
                if (e.target.value.length >= 2) { setDestinationResults(searchAirports(e.target.value)); setShowDestResults(true); }
              }}
              placeholder="Où allez-vous ?" required
              className="w-full bg-navy-900/50 border border-white/10 rounded-2xl px-5 py-3.5 text-white placeholder:text-white/20 focus:outline-none focus:border-navy-500 transition-all" />
            {showDestResults && destinationResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 bg-navy-800 border border-white/10 rounded-2xl mt-1 overflow-hidden shadow-2xl">
                {destinationResults.slice(0, 6).map((a) => (
                  <button key={a.code} type="button" onClick={() => { setDestination(`${a.code} – ${a.city}`); setDestinationCode(a.code); setShowDestResults(false); }}
                    className="w-full px-5 py-3 text-left hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors">
                    <span className="text-white font-bold text-sm">{a.code} – {a.city}</span>
                    <span className="block text-white/40 text-xs">{a.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-1.5">Départ</label>
            <input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} required
              className="w-full bg-navy-900/50 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-navy-500 appearance-none" />
          </div>
          {tripType === 'round-trip' && (
            <div>
              <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-1.5">Retour</label>
              <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)}
                className="w-full bg-navy-900/50 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-navy-500 appearance-none" />
            </div>
          )}
          <div>
            <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-1.5">Devise</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-navy-900/50 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-navy-500 appearance-none">
              <option value="XOF">FCFA (XOF)</option>
              <option value="EUR">Euro (€)</option>
              <option value="USD">Dollar ($)</option>
            </select>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-black tracking-widest uppercase text-sm hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? 'ANALYSE EN COURS...' : 'TROUVER LA MEILLEURE OPTION →'}
        </button>
      </form>

      {error && (
        <div className="glass rounded-2xl px-6 py-4 text-red-400 text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      {apiData && apiData.flights.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-bold text-lg">
              {apiData.flights.length} vol{apiData.flights.length > 1 ? 's' : ''} trouvé{apiData.flights.length > 1 ? 's' : ''}
            </h2>
            <div className="flex items-center gap-2">
              {apiData.source === 'live' ? (
                <span className="text-xs bg-green-500/20 border border-green-500/30 text-green-400 px-3 py-1 rounded-full">• Prix en direct</span>
              ) : (
                <span className="text-xs bg-amber-500/20 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full">• Prix indicatifs</span>
              )}
              {apiData.cached && (
                <span className="text-xs bg-blue-500/20 border border-blue-500/30 text-blue-400 px-3 py-1 rounded-full">⚡ En cache</span>
              )}
            </div>
          </div>
          {apiData.flights.map((flight, idx) => (
            <FlightCard key={flight.id} flight={flight} rank={idx} />
          ))}
        </div>
      )}

      {apiData && apiData.flights.length === 0 && (
        <div className="glass rounded-2xl px-6 py-8 text-center text-white/50">
          Aucun vol trouvé pour cette recherche. Essayez d’autres dates.
        </div>
      )}
    </div>
  );
}
