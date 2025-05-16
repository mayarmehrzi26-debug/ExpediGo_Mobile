import * as Location from "expo-location";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { firebasestore } from "../../../FirebaseConfig";
// AddressModel.ts
export interface Address {
  zone: string;
  address: string;
  latitude: number;
  longitude: number;
  addressText?: string;
  createdAt?: any; // Firestore timestamp
}

export class AddressService {
  static async addAddress(address: Address) {
    try {
      await addDoc(collection(firebasestore, "adresses"), {
        latitude: address.latitude,
        longitude: address.longitude,
        addressText: address.addressText || '',
        createdAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error("Error adding address:", error);
      throw error;
    }
  }

  static async getCurrentLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      throw new Error("Permission to access location was denied");
    }

    const loc = await Location.getCurrentPositionAsync({});
    return {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    };
  }

  static async getCityFromCoords(latitude: number, longitude: number) {
    try {
      const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (address) {
        const place = address.name || address.street || "Place inconnue";
        const city = address.city || address.region || "Ville inconnue";
        return `${place}, ${city}`;
      }
      return "Localisation inconnue";
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      throw error;
    }
  }
}