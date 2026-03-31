'use client';
import { useEffect, useState } from 'react';

interface Promo {
  airline: string;
  title: string;
  description: string;
  link: string;
  icon: string;
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
        link: 'https://www.airfrance.sn',
        icon: '🇫🇷'
      },
      {
        airline: 'Turkish Airlines',
        title: 'Miles bonus x2',
        description: 'Sur tous les vols vers l\'Afrique',
        link: 'https://www.turkishairlines.com',
        icon: '🇹🇷'
      },
      {
        airline: 'Emirates',
        title: 'Business Class -40%',
        description: 'Offre limitée — places rares',
        link: 'https://www.emirates.com',
        icon: '🇦🇪'
      }
    ];
    setTimeout(() => {
      setPromos(mockPromos);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/10 rounded w-3/4"></div>
          <div className="h-4 bg-white/10 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden relative">
      <div className="absolute -top-16 -left-16 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <h2 className="text-xl font-black mb-6 text-white flex items-center gap-2 uppercase tracking-wider">
        <span>✨</span> Promotions en cours
      </h2>

      <div className="grid md:grid-cols-3 gap-4">
        {promos.map((promo, index) => (
          <a
            key={index}
            href={promo.link}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 hover:border-blue-500/40 hover:-translate-y-1 transition-all duration-300 group block"
          >
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">{promo.airline}</span>
                <span className="text-xl group-hover:scale-110 transition-transform">{promo.icon}</span>
              </div>
              <h3 className="font-bold text-white text-base leading-tight mb-2">{promo.title}</h3>
              <p className="text-white/60 text-xs mt-auto">{promo.description}</p>

              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="text-[10px] font-bold text-white/70 group-hover:text-blue-400 flex items-center gap-1 transition-colors">
                  PROFITER DE L'OFFRE <span className="text-xs">→</span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
