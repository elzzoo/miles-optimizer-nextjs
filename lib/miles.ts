// Moteur de calcul Miles vs Cash
// Formule: valeur = (prix_cash - taxes) / miles * 100 (en centimes)

export type MilesRating = 'BAD' | 'OK' | 'GOOD' | 'GREAT'

export interface MilesResult {
  valuePerMile: number      // centimes par mile
  rating: MilesRating
  ratingColor: string
  savingsVsCash: number     // économie en monnaie locale (négatif = cash meilleur)
  totalMilesCost: number    // coût total en achetant les miles au marché
  breakEvenMiles: number    // nb de miles où ça devient rentable
}

// Valeurs marché par programme (centimes / mile)
export const PROGRAM_VALUES: Record<string, { name: string; baseValue: number; promoValue?: number }> = {
  'Air France':      { name: 'Flying Blue',     baseValue: 1.2, promoValue: 1.8 },
  'Turkish Airlines':{ name: 'Miles&Smiles',    baseValue: 1.4, promoValue: 2.1 },
  'Emirates':        { name: 'Skywards',         baseValue: 1.1, promoValue: 1.6 },
  'Qatar Airways':   { name: 'Privilege Club',   baseValue: 1.5, promoValue: 2.2 },
  'British Airways': { name: 'Executive Club',   baseValue: 1.3 },
  'Lufthansa':       { name: 'Miles & More',     baseValue: 1.1 },
}

export function calculateValuePerMile(
  cashPrice: number,
  taxes: number,
  miles: number
): number {
  if (miles <= 0) return 0
  return Number(((cashPrice - taxes) / miles * 100).toFixed(2))
}

export function getMilesRating(value: number): { rating: MilesRating; color: string } {
  if (value >= 2.0) return { rating: 'GREAT', color: '#0ea5e9' }
  if (value >= 1.5) return { rating: 'GOOD',  color: '#10b981' }
  if (value >= 1.0) return { rating: 'OK',    color: '#f59e0b' }
  return                    { rating: 'BAD',   color: '#ef4444' }
}

export function analyzeMiles(
  cashPrice: number,
  taxes: number,
  miles: number,
  airline: string,
  currency = 'EUR'
): MilesResult {
  const valuePerMile = calculateValuePerMile(cashPrice, taxes, miles)
  const { rating, color } = getMilesRating(valuePerMile)
  const programData = PROGRAM_VALUES[airline]
  const marketValue = programData?.promoValue ?? programData?.baseValue ?? 1.2
  const totalMilesCost = (miles * marketValue) / 100
  const savingsVsCash = cashPrice - (totalMilesCost + taxes)
  const breakEvenMiles = taxes < cashPrice
    ? Math.round((cashPrice - taxes) / 0.015)
    : 0

  return {
    valuePerMile,
    rating,
    ratingColor: color,
    savingsVsCash: Math.round(savingsVsCash * 100) / 100,
    totalMilesCost: Math.round(totalMilesCost * 100) / 100,
    breakEvenMiles,
  }
}

export function formatCurrency(amount: number, currency: string): string {
  if (currency === 'XOF') {
    return new Intl.NumberFormat('fr-FR').format(Math.round(amount)) + ' XOF'
  }
  try {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount)
  } catch {
    return `${amount} ${currency}`
  }
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}
