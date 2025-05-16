import * as Location from "expo-location";
import { addDoc, collection,query, where, getDocs, query, serverTimestamp } from "firebase/firestore";
import {firebaseAuth,firebasestore } from "../../../FirebaseConfig";

export interface Address {
  id?: string;
  title: string;
  latitude: number;
  longitude: number;
  address: string;
  createdAt?: any;
  userId: string;

}

export class AddressService {
  static async addAddress(address: Omit<Address, 'id'>) {
    const user = firebaseAuth.currentUser;
    if (!user) throw new Error("Utilisateur non connecté");

    try {
      await addDoc(collection(firebasestore, "adresses"), {
        ...address,
        userId: user.uid,
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
        const street = address.street || address.name || "";
        const city = address.city || "";
        const region = address.region || "";
        const country = address.country || "";
        const postalCode = address.postalCode || "";
        
        return [street, city, region, postalCode, country]
          .filter(part => part !== "")
          .join(", ");
      }
      return "Adresse inconnue";
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return "Impossible de récupérer l'adresse";
    }
  }
  static async getAdresses(): Promise<Address[]> {
    const user = firebaseAuth.currentUser;
    if (!user) throw new Error("Utilisateur non connecté");

    try {
      const q = query(
        collection(firebasestore, "adresses"),
        where("userId", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Address
      }));
    } catch (error) {
      console.error("Error getting addresses:", error);
      throw error;
    }
  }
}