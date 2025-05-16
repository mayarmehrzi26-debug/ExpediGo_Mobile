import { firebaseAuth } from "../../../FirebaseConfig";
import { AddressService } from "../models/Adress";

export class AjoutAdressPresenter {
  private view: AjoutAdressView;
  
  constructor(view: AjoutAdressView) {
    this.view = view;
  }

  async initialize() {
    try {
      const location = await AddressService.getCurrentLocation();
      const address = await AddressService.getCityFromCoords(location.latitude, location.longitude);
      this.view.setLocation(location);
      this.view.setAddressText(address);
    } catch (error) {
      this.view.showError("Permission refusée", "L'application a besoin d'accéder à votre localisation.");
    }
  }

  async handleMapPress(coordinate: { latitude: number; longitude: number }) {
    try {
      this.view.setLocation(coordinate);
      const address = await AddressService.getCityFromCoords(coordinate.latitude, coordinate.longitude);
      this.view.setAddressText(address);
      this.view.closeMapModal();
    } catch (error) {
      this.view.showError("Erreur", "Impossible d'enregistrer la position");
    }
  }

  async submitAddress(addressData: { 
    title: string;
    latitude: number;
    longitude: number;
    addressText: string;
  }) {
    this.view.setLoading(true);
    
    try {
      await AddressService.addAddress({
        title: addressData.title,
        latitude: addressData.latitude,
        longitude: addressData.longitude,
        address: addressData.addressText,
        userId: firebaseAuth.currentUser?.uid || "" // Sera vérifié dans le service
      });
      this.view.showSuccess("Succès", "Adresse enregistrée avec succès", () => {
        this.view.navigateBack();
      });
    } catch (error) {
      this.view.showError("Erreur", error instanceof Error ? error.message : "Échec de l'enregistrement");
    } finally {
      this.view.setLoading(false);
    }
  }
}
export interface AjoutAdressView {
  setLocation(location: { latitude: number; longitude: number }): void;
  setAddressText(address: string): void;
  setLoading(loading: boolean): void;
  showError(title: string, message: string): void;
  showSuccess(title: string, message: string, callback?: () => void): void;
  closeMapModal(): void;
  navigateBack(): void;
}