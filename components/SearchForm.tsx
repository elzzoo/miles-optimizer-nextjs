'use client';
import { useState, useRef, useEffect } from 'react';
import { searchAirports, Airport } from '@/lib/airports';

type TravelClass = 'economy' | 'business' | 'first';

interface FlightResult {
  airline: string;
  cashPrice: number;
  milesRequired: number;
  currency: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  isDirect: boolean;
  class: TravelClass;
}

export default function SearchForm() {
  const [tripType, setTripType] = useState<'one-way' | 'round-trip'>('one-way');
  const [travelClass, setTravelClass] = useState<TravelClass>('economy');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [currency, setCurrency] = useState('XOF');
  const [originResults, setOriginResults] = useState<Airport[]>([]);
  const [destinationResults, setDestinationResults] = useState<Airport[]>([]);
  const [showOriginResults, setShowOriginResults] = useState(false);
  const [showDestResults, setShowDestResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<FlightResult[] | null>(null);

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
    setLoading(true);
    setResults(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const multiplier = travelClass === 'business' ? 2.5 : travelClass === 'first' ? 5 : 1;
      const milesMult = travelClass === 'business' ? 3 : travelClass === 'first' ? 6 : 1;

      const mockResults: FlightResult[] = [
        {
          airline: 'Air France',
          cashPrice: (currency === 'XOF' ? 495000 : 750) * multiplier,
          milesRequired: 25000 * milesMult,
          currency,
          departureTime: '10:30',
          arrivalTime: '18:45',
          duration: '6h 15m',
          isDirect: true,
          class: travelClass
        },
        {
          airline: 'Turkish Airlines',
          cashPrice: (currency === 'XOF' ? 389000 : 590) * multiplier,
          milesRequired: 35000 * milesMult,
          currency,
          departureTime: '22:15',
          arrivalTime: '06:30',
          duration: '8h 15m',
          isDirect: false,
          class: travelClass
        }
      ];
      setResults(mockResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="glass p-10 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
        <form onSubmit={handleSearch} className="relative z-10 space-y-8">
          <div className="flex flex-wrap gap-4">
            <div className="inline-flex p-1.5 bg-navy-950/50 rounded-2xl border border-white/5">
              {['one-way', 'round-trip'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setTripType(type as any)}
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                    tripType === type ? 'bg-navy-600 text-white shadow-lg' : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {type === 'one-way' ? 'Aller Simple' : 'Aller-Retour'}
                </button>
              ))}
            </div>

            <div className="inline-flex p-1.5 bg-navy-950/50 rounded-2xl border border-white/5">
              {(['economy', 'business', 'first'] as TravelClass[]).map((cls) => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => setTravelClass(cls)}
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                    travelClass === cls ? 'bg-blue-600 text-white shadow-lg' : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {cls === 'economy' ? 'Éco' : cls === 'business' ? 'Business' : 'First'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div ref={originRef} className="relative group">
              <label className="text-[10px] font-black uppercase tracking-widest text-navy-400 ml-4 mb-2 block">Origine</label>
              <input
                type="text"
                value={origin}
                onChange={(e) => { setOrigin(e.target.value); if(e.target.value.length >= 2) setOriginResults(searchAirports(e.target.value)); setShowOriginResults(true); }}
                placeholder="D'où partez-vous ?"
                className="w-full bg-navy-900/50 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-navy-500 transition-all"
                required
              />
              {showOriginResults && originResults.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-navy-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl max-h-64 overflow-y-auto">
                  {originResults.map((a) => (
                    <button key={a.code} type="button" onClick={() => { setOrigin(`${a.code} - ${a.city}`); setShowOriginResults(false); }} className="w-full px-6 py-4 text-left hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors">
                      <div className="font-bold text-white">{a.code} - {a.city}</div>
                      <div className="text-[10px] text-white/40 uppercase font-medium">{a.name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div ref={destRef} className="relative group">
              <label className="text-[10px] font-black uppercase tracking-widest text-navy-400 ml-4 mb-2 block">Destination</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => { setDestination(e.target.value); if(e.target.value.length >= 2) setDestinationResults(searchAirports(e.target.value)); setShowDestResults(true); }}
                placeholder="Où allez-vous ?"
                className="w-full bg-navy-900/50 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-navy-500 transition-all"
                required
              />
              {showDestResults && destinationResults.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-navy-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl max-h-64 overflow-y-auto">
                  {destinationResults.map((a) => (
                    <button key={a.code} type="button" onClick={() => { setDestination(`${a.code} - ${a.city}`); setShowDestResults(false); }} className="w-full px-6 py-4 text-left hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors">
                      <div className="font-bold text-white">{a.code} - {a.city}</div>
                      <div className="text-[10px] text-white/40 uppercase font-medium">{a.name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-navy-400 ml-4 block">Départ</label>
              <input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} className="w-full bg-navy-900/50 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-navy-500 appearance-none" required />
            </div>
            {tripType === 'round-trip' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-navy-400 ml-4 block">Retour</label>
                <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} className="w-full bg-navy-900/50 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-navy-500 appearance-none" required />
              </div>
            )}
            <div className={`space-y-2 ${tripType === 'one-way' ? 'md:col-span-2' : ''}`}>
              <label className="text-[10px] font-black uppercase tracking-widest text-navy-400 ml-4 block">Devise</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full bg-navy-900/50 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-navy-500 appearance-none">
                <option value="XOF">FCFA (XOF)</option>
                <option value="EUR">Euro (€)</option>
                <option value="USD">Dollar ($)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !origin || !destination}
            className="w-full bg-navy-600 hover:bg-navy-500 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] transition-all shadow-[0_0_40px_rgba(30,58,138,0.3)] hover:shadow-navy-500/40 disabled:opacity-30 disabled:cursor-not-allowed group"
          >
            {loading ? 'ANALYSE DES VOLS...' : 'TROUVER LA MEILLEURE OPTION →'}
          </button>
        </form>
      </div>

      {results && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-10 duration-700">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Résultats en {travelClass.toUpperCase()}</h2>
            <div className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Optimisé via MilesDB</div>
          </div>

          <div className="grid gap-4">
            {results.map((flight, idx) => {
              const valuePerMile = flight.cashPrice / flight.milesRequired;
              const isOptimized = valuePerMile > (currency === 'XOF' ? 12 : 0.02);

              return (
                <div key={idx} className="bg-navy-950/40 backdrop-blur-md border border-white/5 rounded-[2rem] p-8 hover:border-blue-500/30 transition-all group relative overflow-hidden">
                  <div className="flex flex-col lg:flex-row items-center gap-10">
                    <div className="flex-1 w-full">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">✈️</div>
                        <div>
                          <div className="text-xl font-black text-white leading-none">{flight.airline}</div>
                          <div className="text-xs text-white/40 mt-1 font-bold">{flight.duration} • {flight.isDirect ? 'Direct' : 'Escale'}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between max-w-md">
                        <div className="text-center lg:text-left">
                          <div className="text-3xl font-black text-white tracking-tighter">{flight.departureTime}</div>
                          <div className="text-[10px] font-black text-navy-400 uppercase tracking-widest mt-1">{origin.split(' - ')[0]}</div>
                        </div>
                        <div className="flex-1 px-8 relative"><div className="h-px bg-white/10 w-full"></div></div>
                        <div className="text-center lg:text-right">
                          <div className="text-3xl font-black text-white tracking-tighter">{flight.arrivalTime}</div>
                          <div className="text-[10px] font-black text-navy-400 uppercase tracking-widest mt-1">{destination.split(' - ')[0]}</div>
                        </div>
                      </div>
                    </div>

                    <div className="w-full lg:w-px h-px lg:h-24 bg-white/5"></div>

                    <div className="flex flex-row lg:flex-col items-center lg:items-end gap-10 lg:gap-4 min-w-[200px]">
                      <div className="text-right">
                        <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Prix Cash</div>
                        <div className="text-2xl font-black text-white tracking-tighter">{Math.round(flight.cashPrice).toLocaleString()} {flight.currency}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Miles Requis</div>
                        <div className="text-2xl font-black text-blue-400 tracking-tighter">{flight.milesRequired.toLocaleString()} <span className="text-xs">PTS</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                    <div className="bg-navy-900/50 px-4 py-2 rounded-xl flex items-center gap-3">
                      <span className="text-xs">💡</span>
                      <p className="text-xs font-bold text-white/70">
                        {isOptimized 
                          ? `ÉCONOMIE RÉELLE : En utilisant vos miles, vous économisez ${Math.round(flight.cashPrice).toLocaleString()} ${flight.currency} !`
                          : "CONSEIL : Le prix cash est très bas. Gardez vos miles pour un trajet plus cher."}
                      </p>
                    </div>
                    <button className="bg-white text-navy-950 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-400 transition-colors">Réserver</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
