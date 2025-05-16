import { ClientService } from "../models/ClientModel";

export interface ListeClientsView {
  setClients(clients: any[]): void;
  setLoading(loading: boolean): void;
  setRefreshing(refreshing: boolean): void;
  showError(title: string, message: string): void;
  navigateToAdd(): void;
  navigateToDetails(clientId: string): void;
}

export class ListeClientsPresenter {
  private view: ListeClientsView;
  private navigation: any;

  constructor(view: ListeClientsView) {
    this.view = view;
  }

  async loadClients() {
    try {
      this.view.setLoading(true);
      const clients = await ClientService.getClients();
      this.view.setClients(clients);
    } catch (error) {
      this.view.showError("Erreur", "Impossible de charger les clients");
    } finally {
      this.view.setLoading(false);
    }
  }

  async refreshClients() {
    try {
      this.view.setRefreshing(true);
      const clients = await ClientService.getClients();
      this.view.setClients(clients);
    } catch (error) {
      this.view.showError("Erreur", "Impossible de rafraîchir les clients");
    } finally {
      this.view.setRefreshing(false);
    }
  }
  navigateToAdd() {
    this.navigation.navigate('AjoutClient');
  }

  navigateToDetails(clientId: string) {
    this.navigation.navigate('ClientDetails', { clientId });
  }
}