'use client';

import { useState, useRef, useEffect } from 'react';
import { searchAirports, Airport } from '@/lib/airports';

interface FlightResult {
  airline: string;
  cashPrice: number;
  milesRequired: number;
  currency: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
}

export default function SearchForm() {
  const [tripType, setTripType] = useState<'one-way' | 'round-trip'>('one-way');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [currency, setCurrency] = useState('USD');
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
      if (originRef.current && !originRef.current.contains(event.target as Node)) {
        setShowOriginResults(false);
      }
      if (destRef.current && !destRef.current.contains(event.target as Node)) {
        setShowDestResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOriginChange = (value: string) => {
    setOrigin(value);
    if (value.length >= 2) {
      setOriginResults(searchAirports(value));
      setShowOriginResults(true);
    } else {
      setShowOriginResults(false);
    }
  };

  const handleDestinationChange = (value: string) => {
    setDestination(value);
    if (value.length >= 2) {
      setDestinationResults(searchAirports(value));
      setShowDestResults(true);
    } else {
      setShowDestResults(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResults(null);

    try {
      // Simulation d'appel API avec résultats réalistes
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockResults: FlightResult[] = [
        {
          airline: 'Air France',
          cashPrice: currency === 'EUR' ? 450 : currency === 'XOF' ? 295000 : 480,
          milesRequired: 25000,
          currency,
          departureTime: '10:30',
          arrivalTime: '18:45',
          duration: '6h 15m'
        },
        {
          airline: 'Turkish Airlines',
          cashPrice: currency === 'EUR' ? 380 : currency === 'XOF' ? 249000 : 410,
          milesRequired: 35000,
          currency,
          departureTime: '22:15',
          arrivalTime: '06:30',
          duration: '8h 15m'
        }
      ];
      setResults(mockResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriceColor = (cash: number, miles: number) => {
    // Calcul simplifié de la valeur (1 mile = 0.015 unit)
    const milesValue = miles * 0.015;
    return milesValue < cash ? 'text-green-400' : 'text-blue-400';
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="glass p-8 rounded-2xl space-y-6">
        {/* Type de voyage */}
        <div className="flex space-x-4 mb-4">
          <button
            type="button"
            onClick={() => setTripType('one-way')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              tripType === 'one-way' ? 'bg-navy-600 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            Aller simple
          </button>
          <button
            type="button"
            onClick={() => setTripType('round-trip')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              tripType === 'round-trip' ? 'bg-navy-600 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            Aller-retour
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div ref={originRef} className="relative">
            <label className="block text-sm font-medium mb-2 text-white">Origine</label>
            <input
              type="text"
              value={origin}
              onChange={(e) => handleOriginChange(e.target.value)}
              placeholder="DSS - Dakar"
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:border-navy-500 focus:outline-none"
              required
            />
            {showOriginResults && originResults.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-white rounded-lg shadow-xl max-h-60 overflow-y-auto border border-gray-200">
                {originResults.map((airport) => (
                  <button
                    key={airport.code}
                    type="button"
                    onClick={() => { setOrigin(`${airport.code} - ${airport.city}`); setShowOriginResults(false); }}
                    className="w-full px-4 py-3 text-left hover:bg-navy-50 text-gray-900 flex flex-col border-b last:border-0"
                  >
                    <span className="font-bold">{airport.code} - {airport.city}</span>
                    <span className="text-xs text-gray-500">{airport.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div ref={destRef} className="relative">
            <label className="block text-sm font-medium mb-2 text-white">Destination</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => handleDestinationChange(e.target.value)}
              placeholder="CDG - Paris"
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:border-navy-500 focus:outline-none"
              required
            />
            {showDestResults && destinationResults.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-white rounded-lg shadow-xl max-h-60 overflow-y-auto border border-gray-200">
                {destinationResults.map((airport) => (
                  <button
                    key={airport.code}
                    type="button"
                    onClick={() => { setDestination(`${airport.code} - ${airport.city}`); setShowDestResults(false); }}
                    className="w-full px-4 py-3 text-left hover:bg-navy-50 text-gray-900 flex flex-col border-b last:border-0"
                  >
                    <span className="font-bold">{airport.code} - {airport.city}</span>
                    <span className="text-xs text-gray-500">{airport.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-white">Départ</label>
            <input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:border-navy-500 focus:outline-none"
              required
            />
          </div>

          {tripType === 'round-trip' && (
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Retour</label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:border-navy-500 focus:outline-none"
                required
              />
            </div>
          )}

          <div className={tripType === 'one-way' ? 'md:col-span-2' : ''}>
            <label className="block text-sm font-medium mb-2 text-white">Devise</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:border-navy-500 focus:outline-none appearance-none"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="XOF">FCFA (XOF)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !origin || !destination || !departureDate}
          className="w-full bg-gradient-to-r from-navy-700 to-navy-900 text-white py-4 rounded-xl font-bold hover:from-navy-600 hover:to-navy-800 transition transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Optimisation en cours...
            </span>
          ) : 'Comparer les vols'}
        </button>
      </form>

      {/* Résultats de recherche */}
      {results && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-xl font-bold text-white px-2">Meilleures options trouvées</h2>
          {results.map((flight, idx) => (
            <div key={idx} className="glass-card p-6 rounded-2xl border border-white/10 hover:border-white/20 transition group">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-xl">
                      ✈️
                    </div>
                    <div>
                      <div className="font-bold text-white">{flight.airline}</div>
                      <div className="text-xs text-white/50">{flight.duration} • Direct</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-8">
                    <div>
                      <div className="text-2xl font-bold text-white">{flight.departureTime}</div>
                      <div className="text-xs text-white/40">{origin.split(' - ')[0]}</div>
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                      <div className="w-full h-px bg-white/20 relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/20 text-xs">✈️</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{flight.arrivalTime}</div>
                      <div className="text-xs text-white/40">{destination.split(' - ')[0]}</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col justify-between md:justify-center items-center md:items-end md:pl-8 md:border-l md:border-white/10 gap-4 min-w-[150px]">
                  <div className="text-center md:text-right">
                    <div className="text-xs text-white/50 mb-1">Prix Cash</div>
                    <div className="text-2xl font-bold text-white">
                      {flight.cashPrice.toLocaleString()} {flight.currency}
                    </div>
                  </div>
                  <div className="text-center md:text-right">
                    <div className="text-xs text-white/50 mb-1">Prix Miles</div>
                    <div className={`text-2xl font-bold ${getPriceColor(flight.cashPrice, flight.milesRequired)}`}>
                      {flight.milesRequired.toLocaleString()} Miles
                    </div>
                  </div>
                  <button className="md:w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition">
                    Voir détails
                  </button>
                </div>
              </div>
              
              {/* Badge recommandation */}
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-white/40 italic">Conseil : </span>
                  <span className="text-green-400 font-medium">
                    {flight.milesRequired * 0.015 < flight.cashPrice 
                      ? "Utilisez vos miles ! Vous économisez environ 15%." 
                      : "Payez en cash. Gardez vos miles pour un trajet plus long."}
                  </span>
                </div>
                <div className="hidden md:block text-[10px] text-white/20 uppercase tracking-widest">
                  Updated just now
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
