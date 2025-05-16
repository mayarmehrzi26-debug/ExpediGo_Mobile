// GeocodingService.ts
import localAddresses from './localAddresses.json';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Fichier local contenant les adresses prédéfinies (à créer)
interface LocalAddress {
  address: string;
  latitude: number;
  longitude: number;
}

const addresses: LocalAddress[] = localAddresses;

export const getLocalAddressCoordinates = (address: string): Coordinates | null => {
  const normalizedAddress = address.toLowerCase().trim();
  
  // Recherche exacte
  const exactMatch = addresses.find(a => 
    a.address.toLowerCase().trim() === normalizedAddress
  );
  
  if (exactMatch) {
    return {
      latitude: exactMatch.latitude,
      longitude: exactMatch.longitude
    };
  }

  // Recherche partielle
  const partialMatch = addresses.find(a => 
    a.address.toLowerCase().includes(normalizedAddress) ||
    normalizedAddress.includes(a.address.toLowerCase())
  );

  return partialMatch ? {
    latitude: partialMatch.latitude,
    longitude: partialMatch.longitude
  } : null;
};