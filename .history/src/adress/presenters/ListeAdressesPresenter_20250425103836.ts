import { Address, AddressService } from "../models/Adress";

export class ListeAdressesPresenter {
  private view: ListeAdressesView;
  
  constructor(view: ListeAdressesView) {
    this.view = view;
  }

  async loadAdresses() {
    this.view.setLoading(true);
    try {
      const adresses = await AddressService.getAdresses();
      this.view.setAdresses(adresses);
    } catch (error) {
      this.view.showError("Erreur", "Impossible de charger les adresses");
    } finally {
      this.view.setLoading(false);
    }
  }

  navigateToAdd() {
    this.view.navigateToAdd();
  }
}

export interface ListeAdressesView {
  setAdresses(adresses: Address[]): void;
  setLoading(loading: boolean): void;
  showError(title: string, message: string): void;
  navigateToAdd(): void;
}