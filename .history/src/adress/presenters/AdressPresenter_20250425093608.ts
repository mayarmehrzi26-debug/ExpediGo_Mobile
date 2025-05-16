// AjoutAdressPresenter.ts
import { Address, AddressService } from './AddressModel';

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
      const zone = await AddressService.getCityFromCoords(coordinate.latitude, coordinate.longitude);
      this.view.setLocation(coordinate);
      this.view.setZone(zone);
      this.view.closeMapModal();
    } catch (error) {
      this.view.showError("Erreur", "Impossible de déterminer la localisation");
    }
  }

  async submitAddress(addressData: Omit<Address, 'createdAt'>) {
    if (!addressData.zone || !addressData.address || !addressData.latitude || !addressData.longitude) {
      this.view.showError("Erreur", "Veuillez remplir tous les champs et choisir une zone sur la carte.");
      return;
    }

    this.view.setLoading(true);
    
    try {
      await AddressService.addAddress(addressData);
      this.view.showSuccess("Succès", "Adresse ajoutée avec succès", () => {
        this.view.navigateBack();
      });
    } catch (error) {
      this.view.showError("Erreur", "Une erreur s'est produite lors de l'ajout de l'adresse");
    } finally {
      this.view.setLoading(false);
    }
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