'use client';

import { useState } from 'react';

export default function SearchForm() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [currency, setCurrency] = useState('USD');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching flights:', { origin, destination, date, currency });
  };

  return (
    <form onSubmit={handleSubmit} className="glass p-8 rounded-2xl space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Origine</label>
          <input
            type="text"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="DSS - Dakar"
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-navy-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Destination</label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="CDG - Paris"
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-navy-500 focus:outline-none"
            required
          />
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
        className="w-full bg-gradient-to-r from-navy-700 to-navy-900 text-white py-4 rounded-lg font-semibold hover:opacity-90 transition"
      >
        Rechercher des vols
      </button>
    </form>
  );
}
