'use client';

import { useEffect, useState } from 'react';

interface Promo {
  airline: string;
  title: string;
  description: string;
  link: string;
}

export default function PromosBanner() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated promos data - in production, this would fetch from SerpAPI
    const mockPromos: Promo[] = [
      {
        airline: 'Air France',
        title: '-30% sur Paris-Dakar',
        description: 'Offre valable jusqu\'au 15 avril',
        link: '#'
      },
      {
        airline: 'Turkish Airlines',
        title: 'Miles bonus x2',
        description: 'Sur tous les vols vers l\'Afrique',
        link: '#'
      },
      {
        airline: 'Emirates',
        title: 'Business Class -40%',
        description: 'Offre limitée',
        link: '#'
      }
    ];

    setTimeout(() => {
      setPromos(mockPromos);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="glass-card p-6 rounded-2xl">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/20 rounded w-3/4"></div>
          <div className="h-4 bg-white/20 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 rounded-2xl">
      <h2 className="text-2xl font-bold mb-4 text-white">✨ Promotions en cours</h2>
      <div className="space-y-4">
        {promos.map((promo, index) => (
          <div
            key={index}
            className="bg-white/10 p-4 rounded-lg hover:bg-white/20 transition cursor-pointer border border-white/20"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg text-white">{promo.airline}</h3>
                <p className="text-blue-200 font-medium text-base">{promo.title}</p>
                <p className="text-sm text-gray-300 mt-1">{promo.description}</p>
              </div>
              <span className="text-2xl">✈️</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
