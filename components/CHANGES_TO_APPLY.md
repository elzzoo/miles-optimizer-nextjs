# 🛠️ Modifications à Appliquer - SearchForm.tsx

## ❌ Étape 1: Supprimer les constantes (lignes 22-62)

Supprime TOUT le bloc suivant:

```typescript
// Base de données des prix d'acquisition des miles (Source: Sites officiels)
const MILES_PRICES: Record<string, { base: number, promo?: number, currency: string }> = {
  'Air France': { base: 0.027, promo: 0.0169, currency: 'EUR' },
  'Turkish Airlines': { base: 0.030, currency: 'USD' },
  'Emirates': { base: 0.030, promo: 0.021, currency: 'USD' },
  'Qatar Airways': { base: 0.035, promo: 0.022, currency: 'USD' },
};

const EXCHANGE_RATES: Record<string, number> = {
  EUR_XOF: 655.957,
  USD_XOF: 610.0,
  EUR_USD: 1.08,
  USD_EUR: 0.92,
};

export default function SearchForm() {
  // ... reste du code
}
```

## ❌ Étape 2: Supprimer la fonction convertToTargetCurrency (lignes 65-73)

Supprime:

```typescript
const convertToTargetCurrency = (amount: number, from: string, to: string) => {
  if (from === to) return amount;
  const key = `${from}_${to}`;
  if (EXCHANGE_RATES[key]) return amount * EXCHANGE_RATES[key];
  const invKey = `${to}_${from}`;
  if (EXCHANGE_RATES[invKey]) return amount / EXCHANGE_RATES[invKey];
  return amount;
};
```

## ✅ Étape 3: Remplacer handleSearch (lignes 75-114)

### Ancien code à supprimer:
```typescript
const handleSearch = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setResults(null);

  try {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const multiplier = travelClass === 'business' ? 2.5 : travelClass === 'first' ? 5 : 1;
    const milesMult = travelClass === 'business' ? 3 : travelClass === 'first' ? 6 : 1;

    const airlines = ['Air France', 'Turkish Airlines'];
    const mockResults: FlightResult[] = airlines.map(name => {
      const pricing = MILES_PRICES[name] || { base: 0.03, currency: 'USD' };
      const pricePerMile = pricing.promo || pricing.base;
      const milesPriceInTarget = convertToTargetCurrency(pricePerMile, pricing.currency, currency);

      return {
        airline: name,
        cashPrice: (name === 'Air France' ? (currency === 'XOF' ? 495000 : 750) : (currency === 'XOF' ? 389000 : 590)) * multiplier,
        milesRequired: (name === 'Air France' ? 25000 : 35000) * milesMult,
        currency,
        departureTime: name === 'Air France' ? '10:30' : '22:15',
        arrivalTime: name === 'Air France' ? '18:45' : '06:30',
        duration: name === 'Air France' ? '6h 15m' : '8h 15m',
        isDirect: name === 'Air France',
        class: travelClass,
        bookingUrl: name === 'Air France' ? 'https://www.airfrance.sn' : 'https://www.turkishairlines.com',
        milesPriceUsed: milesPriceInTarget,
        isPromoApplied: !!pricing.promo
      };
    });

    setResults(mockResults);
  } catch (error) {
    console.error('Search error:', error);
  } finally {
    setLoading(false);
  }
};
```

### Nouveau code à insérer:
```typescript
const handleSearch = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setResults(null);

  try {
    const params = new URLSearchParams({
      origin,
      destination,
      class: travelClass,
      currency,
    });

    if (departureDate) params.set('departureDate', departureDate);
    if (returnDate && tripType === 'round-trip') params.set('returnDate', returnDate);

    const response = await fetch(`/api/flights?${params.toString()}`);
    const data = await response.json();

    if (data.results) {
      setResults(data.results);
    } else {
      throw new Error('Aucune donnée de vol reçue');
    }
  } catch (error) {
    console.error('Erreur de recherche:', error);
    alert('Erreur lors de la recherche. Veuillez réessayer.');
  } finally {
    setLoading(false);
  }
};
```

## 📝 Résumé des changements

1. **Supprimer** `MILES_PRICES` constant (lignes 22-30)
2. **Supprimer** `EXCHANGE_RATES` constant (lignes 32-37)
3. **Supprimer** `convertToTargetCurrency` function (lignes 65-73)
4. **Remplacer** `handleSearch` function complètement (lignes 75-114)

Le nouveau `handleSearch` est BEAUCOUP plus simple car il appelle l'API route `/api/flights` qui gère toute la logique.

## ⚠️ Important

Après ces modifications:
- L'interface `FlightResult` reste identique (pas de changement)
- Tous les autres hooks et state variables restent identiques
- Le JSX de rendu reste identique

## 🚀 Pour appliquer:

**Option 1 (Recommandée):** Clone le repo localement et applique les changements
```bash
git clone https://github.com/elzzoo/miles-optimizer-nextjs.git
cd miles-optimizer-nextjs
# Ouvre components/SearchForm.tsx dans ton éditeur
# Applique les changements ci-dessus
git add components/SearchForm.tsx
git commit -m "Update SearchForm to use /api/flights endpoint"
git push
```

**Option 2:** Utilise l'éditeur GitHub web mais fais attention aux numéros de lignes
