// AjoutAdressPresenter.ts
import { Address, AddressService } from '../models/Adress';

export class AjoutAdressPresenter {
  private view: AjoutAdressView;
  
  constructor(view: AjoutAdressView) {
    this.view = view;
  }

  async initialize() {
    try {
      const location = await AddressService.getCurrentLocation();
      const zone = await AddressService.getCityFromCoords(location.latitude, location.longitude);
      this.view.setLocation(location);
      this.view.setZone(zone);
    } catch (error) {
      this.view.showError("Permission refusée", "L'application a besoin d'accéder à votre localisation.");
    }
  }

  async handleMapPress(coordinate: { latitude: number; longitude: number }) {
    try {
      this.view.setLocation(coordinate);
      this.view.closeMapModal();
    } catch (error) {
      this.view.showError("Erreur", "Impossible d'enregistrer la position");
    }
  }

  async submitAddress(coordinates: { latitude: number; longitude: number }) {
    this.view.setLoading(true);
    
    try {
      await AddressService.addAddress({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      });
      this.view.showSuccess("Succès", "Position enregistrée avec succès", () => {
        this.view.navigateBack();
      });
    } catch (error) {
      this.view.showError("Erreur", "Échec de l'enregistrement de la position");
    } finally {
      this.view.setLoading(false);
    }
  }
  

export interface AjoutAdressView {
  setLocation(location: { latitude: number; longitude: number }): void;
  setZone(zone: string): void;
  setLoading(loading: boolean): void;
  showError(title: string, message: string): void;
  showSuccess(title: string, message: string, callback?: () => void): void;
  closeMapModal(): void;
  navigateBack(): void;
}