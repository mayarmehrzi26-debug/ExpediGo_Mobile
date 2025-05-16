// GeocodingService.ts
export interface Coordinates {
    latitude: number;
    longitude: number;
  }
  
  // Cache simple en mémoire
  const geocodeCache = new Map<string, Coordinates>();
  
  /**
   * Service de géocodage utilisant Nominatim (OpenStreetMap)
   * Avec gestion des erreurs et cache
   */
  export const getAddressCoordinates = async (address: string): Promise<Coordinates | null> => {
    // Vérifier le cache d'abord
    if (geocodeCache.has(address)) {
      return geocodeCache.get(address) || null;
    }
  
    try {
      const formattedAddress = encodeURIComponent(address);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${formattedAddress}&limit=1`,
        {
          headers: {
            'User-Agent': 'YourAppName/1.0 (your@email.com)', // Obligatoire pour Nominatim
            'Accept-Language': 'fr-FR', // Langue des résultats
          }
        }
      );
  
      // Vérifier le type de contenu
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error('Réponse non-JSON du serveur');
      }
  
      const data = await response.json();
      
      if (!data || data.length === 0) {
        return null;
      }
  
      const result = {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
  
      // Mettre en cache
      geocodeCache.set(address, result);
      return result;
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    }
  };
  
  /**
   * Solution de repli avec MapQuest (gratuit avec clé API)
   */
  export const getFallbackCoordinates = async (address: string): Promise<Coordinates | null> => {
    try {
      const response = await fetch(
        `https://www.mapquestapi.com/geocoding/v1/address?key=YOUR_MAPQUEST_KEY&location=${encodeURIComponent(address)}`
      );
      
      const data = await response.json();
      
      if (data?.results?.[0]?.locations?.[0]?.latLng) {
        return {
          latitude: data.results[0].locations[0].latLng.lat,
          longitude: data.results[0].locations[0].latLng.lng,
        };
      }
      return null;
    } catch (error) {
      console.error('Fallback geocoding error:', error);
      return null;
    }
  };