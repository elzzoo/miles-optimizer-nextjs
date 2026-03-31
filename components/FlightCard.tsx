import { type Flight } from '@/lib/flights'
import { type MilesResult, formatCurrency, formatDuration } from '@/lib/miles'

interface Props {
  flight: Flight & { miles: number; taxes: number; analysis: MilesResult }
  rank: number
}

const AIRLINE_COLORS: Record<string, string> = {
  'Air France':       'text-blue-400',
  'Turkish Airlines': 'text-red-400',
  'Emirates':         'text-yellow-400',
  'Qatar Airways':    'text-purple-400',
}

export default function FlightCard({ flight, rank }: Props) {
  const { analysis } = flight
  const isBest = rank === 0
  const milesWin = analysis.savingsVsCash > 0
  const color = AIRLINE_COLORS[flight.airline] ?? 'text-gray-300'

  return (
    <div className={`rounded-2xl border p-6 transition-all ${
      isBest
        ? 'border-blue-500/60 bg-blue-950/20'
        : 'border-gray-800 bg-[#111827]'
    }`}>

      {/* Badge meilleure valeur */}
      {isBest && (
        <div className="mb-3">
          <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            ⭐ Meilleure valeur miles
          </span>
        </div>
      )}

      {/* Header: compagnie + prix */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-bold text-lg ${color}`}>{flight.airline}</span>
            {(analysis.rating === 'GREAT' || analysis.rating === 'GOOD') && (
              <span className="bg-violet-500/20 text-violet-300 text-xs px-2 py-0.5 rounded-full font-semibold">
                PROMO MILES
              </span>
            )}
            {flight.source === 'live' && (
              <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full">LIVE</span>
            )}
          </div>
          <p className="text-gray-400 text-sm">
            {formatDuration(flight.duration)}
            {' · '}
            {flight.isDirect ? 'Direct' : `${flight.stops} escale${flight.stops > 1 ? 's' : ''}`}
          </p>
        </div>

        <div className="text-right shrink-0">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Prix cash public</p>
          <p className="text-2xl font-bold text-white">
            {formatCurrency(flight.price, flight.currency)}
          </p>
          <p className="text-xs text-blue-400 uppercase tracking-wider mt-2">Coût acquisition miles</p>
          <p className="text-2xl font-bold text-blue-400">
            {formatCurrency(analysis.totalMilesCost + flight.taxes, flight.currency)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {flight.miles.toLocaleString()} pts @ {analysis.valuePerMile.toFixed(2)} c/pt
          </p>
        </div>
      </div>

      {/* Horaires */}
      <div className="flex items-center gap-4 mt-5">
        <div>
          <p className="text-2xl font-bold">{flight.departureTime}</p>
          <p className="text-xs text-gray-500">{flight.origin}</p>
        </div>
        <div className="flex-1 relative">
          <div className="border-t border-dashed border-gray-700" />
          <p className="text-center text-xs text-gray-500 mt-1">{formatDuration(flight.duration)}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{flight.arrivalTime}</p>
          <p className="text-xs text-gray-500">{flight.destination}</p>
        </div>
      </div>

      {/* Verdict */}
      <div className={`mt-4 rounded-xl p-3 text-sm font-medium flex items-start gap-2 ${
        milesWin
          ? 'bg-green-500/10 border border-green-500/20 text-green-400'
          : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
      }`}>
        <span className="mt-0.5">{milesWin ? '✅' : '⚠️'}</span>
        <span>
          {milesWin
            ? `OPTIMISÉ : Les miles vous font économiser ${formatCurrency(analysis.savingsVsCash, flight.currency)} vs le cash.`
            : `CONSEIL : Le prix cash est plus avantageux (diff. ${formatCurrency(Math.abs(analysis.savingsVsCash), flight.currency)}).`
          }
        </span>
      </div>

      {/* CTA */}
      <a
        href={`https://www.google.com/flights?q=${flight.origin}+${flight.destination}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 block w-full text-center py-2.5 rounded-xl border border-gray-700 text-gray-300 text-sm font-semibold hover:border-blue-500 hover:text-blue-400 transition-colors"
      >
        Réserver mon vol →
      </a>
    </div>
  )
}
