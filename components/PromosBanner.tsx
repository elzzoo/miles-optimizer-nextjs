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
      <div className="glass p-6 rounded-2xl border border-white/10">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/10 rounded w-3/4"></div>
          <div className="h-4 bg-white/10 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass p-8 rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative group">
      {/* Effet de brillance en arrière-plan */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-navy-500/20 rounded-full blur-3xl group-hover:bg-navy-400/30 transition-all duration-700"></div>
      
      <h2 className="text-2xl font-black mb-6 text-white flex items-center gap-2">
        <span className="text-navy-400">✨</span> Offres Spéciales
      </h2>
      
      <div className="grid md:grid-cols-3 gap-4">
        {promos.map((promo, index) => (
          <div
            key={index}
            className="bg-navy-900/40 backdrop-blur-md p-5 rounded-2xl border border-white/5 hover:border-navy-500/50 transition-all duration-300 hover:transform hover:-translate-y-1 group/item"
          >
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-navy-400">{promo.airline}</span>
                <span className="text-xl group-hover/item:scale-110 transition-transform">✈️</span>
              </div>
              <h3 className="font-bold text-white text-base leading-tight mb-2">{promo.title}</h3>
              <p className="text-white/50 text-xs mt-auto">{promo.description}</p>
              
              <div className="mt-4 pt-4 border-t border-white/5">
                <button className="text-[10px] font-bold text-white hover:text-navy-400 flex items-center gap-1 transition-colors">
                  PROFITER DE L'OFFRE <span className="text-xs">→</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
