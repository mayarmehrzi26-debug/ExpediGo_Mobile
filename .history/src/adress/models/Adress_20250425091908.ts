import * as Location from "expo-location";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { firebasestore } from "../../../FirebaseConfig";

export interface LocationData {
  latitude: number;
  longitude: number;
}

export class Adress {
  static async requestLocationPermission(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === "granted";
  }

  static async getCurrentLocation(): Promise<LocationData> {
    const loc = await Location.getCurrentPositionAsync({});
    return {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    };
  }

  static async getCityFromCoords(latitude: number, longitude: number): Promise<string> {
    try {
      const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (address) {
        const place = address.name || address.street || "Place inconnue";
        const city = address.city || address.region || "Ville inconnue";
        return `${place}, ${city}`;
      }
    } catch (error) {
      console.error("Erreur de géocodage inverse:", error);
    }
    return "Localisation inconnue";
  }

  static async saveAddress(
    zone: string,
    address: string,
    location: LocationData
  ): Promise<void> {
    await addDoc(collection(firebasestore, "adresses"), {
      zone,
      address,
      latitude: location.latitude,
      longitude: location.longitude,
      createdAt: serverTimestamp(),
    });
  }
}