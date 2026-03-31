'use client';

import { useState, useRef, useEffect } from 'react';
import { searchAirports, Airport } from '@/lib/airports';

export default function SearchForm() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [originResults, setOriginResults] = useState<Airport[]>([]);
  const [destinationResults, setDestinationResults] = useState<Airport[]>([]);
  const [showOriginResults, setShowOriginResults] = useState(false);
  const [showDestResults, setShowDestResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const originRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
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
      const results = searchAirports(value);
      setOriginResults(results);
      setShowOriginResults(true);
    } else {
      setShowOriginResults(false);
    }
  };

  const handleDestinationChange = (value: string) => {
    setDestination(value);
    if (value.length >= 2) {
      const results = searchAirports(value);
      setDestinationResults(results);
      setShowDestResults(true);
    } else {
      setShowDestResults(false);
    }
  };

  const selectOrigin = (airport: Airport) => {
    setOrigin(`${airport.code} - ${airport.city}`);
    setShowOriginResults(false);
  };

  const selectDestination = (airport: Airport) => {
    setDestination(`${airport.code} - ${airport.city}`);
    setShowDestResults(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Extraire les codes d'aéroport
      const originCode = origin.split(' - ')[0];
      const destCode = destination.split(' - ')[0];

      console.log('Searching flights:', { originCode, destCode, date, currency });
      // TODO: Appeler l'API de recherche ici
      
      // Simulation
      await new Promise(resolve => setTimeout(resolve, 2000));
      setResults({
        cashPrice: 450,
        milesRequired: 25000,
        recommendation: 'Miles'
      });
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass p-8 rounded-2xl space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Origine</label>
          <div ref={originRef} className="relative">
            <input
              type="text"
              value={origin}
              onChange={(e) => handleOriginChange(e.target.value)}
              placeholder="DSS - Dakar"
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-navy-500 focus:outline-none"
              required
            />
            {showOriginResults && originResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {originResults.map((airport) => (
                  <button
                    key={airport.code}
                    type="button"
                    onClick={() => selectOrigin(airport)}
                    className="w-full px-4 py-2 text-left hover:bg-navy-100 text-gray-800 border-b border-gray-100 last:border-0"
                  >
                    <div className="font-semibold">{airport.code} - {airport.city}</div>
                    <div className="text-sm text-gray-600">{airport.name} ({airport.country})</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Destination</label>
          <div ref={destRef} className="relative">
            <input
              type="text"
              value={destination}
              onChange={(e) => handleDestinationChange(e.target.value)}
              placeholder="CDG - Paris"
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-navy-500 focus:outline-none"
              required
            />
            {showDestResults && destinationResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {destinationResults.map((airport) => (
                  <button
                    key={airport.code}
                    type="button"
                    onClick={() => selectDestination(airport)}
                    className="w-full px-4 py-2 text-left hover:bg-navy-100 text-gray-800 border-b border-gray-100 last:border-0"
                  >
                    <div className="font-semibold">{airport.code} - {airport.city}</div>
                    <div className="text-sm text-gray-600">{airport.name} ({airport.country})</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-navy-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Devise</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-navy-500 focus:outline-none"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="XOF">FCFA (XOF)</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !origin || !destination || !date}
        className="w-full bg-gradient-to-r from-navy-700 to-navy-900 text-white py-4 rounded-lg font-semibold hover:opacity-90 transition disabled:bg-gray-600 disabled:bg-gradient-to-r disabled:bg-none disabled:cursor-not-allowed"
      >
        {loading ? 'Recherche en cours...' : 'Rechercher des vols'}
      </button>

      {/* Résultats */}
      {results && (
        <div className="glass-card p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4 text-white">Résultats de recherche</h2>
          <pre className="text-white text-sm overflow-auto">{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
    </form>
  );
}
