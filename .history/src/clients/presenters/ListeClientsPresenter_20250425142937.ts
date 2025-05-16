import { NavigationProp } from "@react-navigation/native";
import { ClientService } from "../models/ClientModel";

export interface ListeClientsView {
  setClients(clients: any[]): void;
  setLoading(loading: boolean): void;
  setRefreshing(refreshing: boolean): void;
  showError(title: string, message: string): void;
}  showConfirmation(title: string, message: string, onConfirm: () => void): void;


export class ListeClientsPresenter {
  private view: ListeClientsView;
  private navigation: NavigationProp<any>;

  constructor(view: ListeClientsView, navigation: NavigationProp<any>) {
    this.view = view;
    this.navigation = navigation;
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
  async updateClient(clientId: string, clientData: Partial<Client>) {
    try {
      this.view.setLoading(true);
      await ClientService.updateClient(clientId, clientData);
      await this.loadClients(); // Recharger la liste après modification
    } catch (error) {
      this.view.showError("Erreur", "Impossible de modifier le client");
    } finally {
      this.view.setLoading(false);
    }
  }

  async deleteClient(clientId: string) {
    try {
      this.view.setLoading(true);
      await ClientService.deleteClient(clientId);
      await this.loadClients(); // Recharger la liste après suppression
    } catch (error) {
      this.view.showError("Erreur", "Impossible de supprimer le client");
    } finally {
      this.view.setLoading(false);
    }
  }
}