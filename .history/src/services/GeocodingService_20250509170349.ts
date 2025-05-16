export interface Coordinates {
    latitude: number;
    longitude: number;
  }
  
  export const getAddressCoordinates = async (address: string): Promise<Coordinates | null> => {
    try {
      const formattedAddress = encodeURIComponent(address);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${formattedAddress}&limit=1`
      );
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
        };
      }
      
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };