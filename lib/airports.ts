export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

export const airports: Airport[] = [
  // Afrique
  { code: 'DKR', name: 'Aéroport international Blaise Diagne', city: 'Dakar', country: 'Sénégal' },
  { code: 'DSS', name: 'Aéroport Léopold Sédar Senghor', city: 'Dakar', country: 'Sénégal' },
  { code: 'CAI', name: 'Cairo International Airport', city: 'Le Caire', country: 'Égypte' },
  { code: 'ADD', name: 'Addis Ababa Bole International', city: 'Addis-Abeba', country: 'Éthiopie' },
  { code: 'JNB', name: 'OR Tambo International', city: 'Johannesburg', country: 'Afrique du Sud' },
  { code: 'CPT', name: 'Cape Town International', city: 'Le Cap', country: 'Afrique du Sud' },
  { code: 'LOS', name: 'Murtala Muhammed International', city: 'Lagos', country: 'Nigéria' },
  { code: 'ABJ', name: 'Félix Houphouët-Boigny International', city: 'Abidjan', country: 'Côte d\'Ivoire' },
  { code: 'ACC', name: 'Kotoka International', city: 'Accra', country: 'Ghana' },
  { code: 'CMN', name: 'Mohammed V International', city: 'Casablanca', country: 'Maroc' },
  { code: 'RAK', name: 'Marrakech Menara', city: 'Marrakech', country: 'Maroc' },
  { code: 'TUN', name: 'Tunis-Carthage International', city: 'Tunis', country: 'Tunisie' },
  { code: 'ALG', name: 'Houari Boumediene Airport', city: 'Alger', country: 'Algérie' },
  { code: 'NBO', name: 'Jomo Kenyatta International', city: 'Nairobi', country: 'Kenya' },
  { code: 'DAR', name: 'Julius Nyerere International', city: 'Dar es Salaam', country: 'Tanzanie' },
  
  // Europe
  { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France' },
  { code: 'ORY', name: 'Orly', city: 'Paris', country: 'France' },
  { code: 'LHR', name: 'Heathrow', city: 'Londres', country: 'Royaume-Uni' },
  { code: 'LGW', name: 'Gatwick', city: 'Londres', country: 'Royaume-Uni' },
  { code: 'AMS', name: 'Schiphol', city: 'Amsterdam', country: 'Pays-Bas' },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Francfort', country: 'Allemagne' },
  { code: 'MAD', name: 'Adolfo Suárez Madrid-Barajas', city: 'Madrid', country: 'Espagne' },
  { code: 'BCN', name: 'Barcelona-El Prat', city: 'Barcelone', country: 'Espagne' },
  { code: 'FCO', name: 'Leonardo da Vinci-Fiumicino', city: 'Rome', country: 'Italie' },
  { code: 'MXP', name: 'Milano Malpensa', city: 'Milan', country: 'Italie' },
  { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turquie' },
  { code: 'SAW', name: 'Sabiha Gökçen', city: 'Istanbul', country: 'Turquie' },
  { code: 'ZRH', name: 'Zurich Airport', city: 'Zurich', country: 'Suisse' },
  { code: 'VIE', name: 'Vienna International', city: 'Vienne', country: 'Autriche' },
  { code: 'BRU', name: 'Brussels Airport', city: 'Bruxelles', country: 'Belgique' },
  { code: 'LIS', name: 'Humberto Delgado', city: 'Lisbonne', country: 'Portugal' },
  { code: 'ATH', name: 'Athens International', city: 'Athènes', country: 'Grèce' },
  
  // Moyen-Orient
  { code: 'DXB', name: 'Dubai International', city: 'Dubaï', country: 'Émirats Arabes Unis' },
  { code: 'DOH', name: 'Hamad International', city: 'Doha', country: 'Qatar' },
  { code: 'AUH', name: 'Abu Dhabi International', city: 'Abu Dhabi', country: 'Émirats Arabes Unis' },
  { code: 'JED', name: 'King Abdulaziz International', city: 'Djeddah', country: 'Arabie Saoudite' },
  { code: 'RUH', name: 'King Khalid International', city: 'Riyad', country: 'Arabie Saoudite' },
  { code: 'TLV', name: 'Ben Gurion', city: 'Tel Aviv', country: 'Israël' },
  { code: 'BEY', name: 'Rafic Hariri International', city: 'Beyrouth', country: 'Liban' },
  
  // Amérique du Nord
  { code: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'États-Unis' },
  { code: 'EWR', name: 'Newark Liberty International', city: 'New York', country: 'États-Unis' },
  { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'États-Unis' },
  { code: 'ORD', name: 'O\'Hare International', city: 'Chicago', country: 'États-Unis' },
  { code: 'ATL', name: 'Hartsfield-Jackson Atlanta', city: 'Atlanta', country: 'États-Unis' },
  { code: 'MIA', name: 'Miami International', city: 'Miami', country: 'États-Unis' },
  { code: 'SFO', name: 'San Francisco International', city: 'San Francisco', country: 'États-Unis' },
  { code: 'YYZ', name: 'Toronto Pearson', city: 'Toronto', country: 'Canada' },
  { code: 'YUL', name: 'Montréal-Trudeau', city: 'Montréal', country: 'Canada' },
  
  // Asie
  { code: 'SIN', name: 'Singapore Changi', city: 'Singapour', country: 'Singapour' },
  { code: 'HKG', name: 'Hong Kong International', city: 'Hong Kong', country: 'Hong Kong' },
  { code: 'PEK', name: 'Beijing Capital International', city: 'Pékin', country: 'Chine' },
  { code: 'PVG', name: 'Shanghai Pudong', city: 'Shanghai', country: 'Chine' },
  { code: 'NRT', name: 'Narita International', city: 'Tokyo', country: 'Japon' },
  { code: 'HND', name: 'Tokyo Haneda', city: 'Tokyo', country: 'Japon' },
  { code: 'ICN', name: 'Incheon International', city: 'Séoul', country: 'Corée du Sud' },
  { code: 'BKK', name: 'Suvarnabhumi', city: 'Bangkok', country: 'Thaïlande' },
  { code: 'KUL', name: 'Kuala Lumpur International', city: 'Kuala Lumpur', country: 'Malaisie' },
  { code: 'DEL', name: 'Indira Gandhi International', city: 'New Delhi', country: 'Inde' },
  { code: 'BOM', name: 'Chhatrapati Shivaji International', city: 'Mumbai', country: 'Inde' },
  
  // Océanie
  { code: 'SYD', name: 'Sydney Kingsford Smith', city: 'Sydney', country: 'Australie' },
  { code: 'MEL', name: 'Melbourne Airport', city: 'Melbourne', country: 'Australie' },
  { code: 'AKL', name: 'Auckland Airport', city: 'Auckland', country: 'Nouvelle-Zélande' },
  
  // Amérique du Sud
  { code: 'GRU', name: 'São Paulo-Guarulhos', city: 'São Paulo', country: 'Brésil' },
  { code: 'GIG', name: 'Rio de Janeiro-Galeão', city: 'Rio de Janeiro', country: 'Brésil' },
  { code: 'EZE', name: 'Ministro Pistarini', city: 'Buenos Aires', country: 'Argentine' },
  { code: 'BOG', name: 'El Dorado International', city: 'Bogotá', country: 'Colombie' },
  { code: 'LIM', name: 'Jorge Chávez International', city: 'Lima', country: 'Pérou' },
];

export function searchAirports(query: string): Airport[] {
  if (!query || query.length < 2) return [];
  
  const lowerQuery = query.toLowerCase();
  return airports.filter(airport => 
    airport.code.toLowerCase().includes(lowerQuery) ||
    airport.name.toLowerCase().includes(lowerQuery) ||
    airport.city.toLowerCase().includes(lowerQuery) ||
    airport.country.toLowerCase().includes(lowerQuery)
  ).slice(0, 10); // Limiter à 10 résultats
}
