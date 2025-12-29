import { NavigationProp } from "@react-navigation/native";
import { ClientService } from "../models/ClientModel";

export interface ListeClientsView {
  setClients(clients: any[]): void;
  setLoading(loading: boolean): void;
  setRefreshing(refreshing: boolean): void;
  showError(title: string, message: string): void;
  showConfirmation(title: string, message: string, onConfirm: () => void): void;
  showSuccess(message: string): void;
}
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
      const clients = await ClientService.getClientsByCurrentUser(); // Modification ici
      this.view.setClients(clients);
    } catch (error) {
      this.view.showError("Erreur", error.message || "Impossible de charger les clients");
    } finally {
      this.view.setLoading(false);
    }
  }

  async refreshClients() {
    try {
      this.view.setRefreshing(true);
      const clients = await ClientService.getClientsByCurrentUser(); // Modification ici
      this.view.setClients(clients);
    } catch (error) {
      this.view.showError("Erreur", error.message || "Impossible de rafraîchir les clients");
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

  navigateToEdit(clientId: string) {
    this.navigation.navigate('ModifierClient', { clientId });
  }

  async updateClient(clientId: string, clientData: Partial<Client>) {
    try {
      this.view.setLoading(true);
      const clientExists = await ClientService.getClientById(clientId);
      if (!clientExists) {
        throw new Error("Client non trouvé");
      }
      await ClientService.updateClient(clientId, clientData);
      this.view.showSuccess("Client mis à jour avec succès");
      await this.loadClients();
    } catch (error) {
      this.view.showError("Erreur", error.message || "Impossible de modifier le client");
    } finally {
      this.view.setLoading(false);
    }
  }

  async deleteClient(clientId: string) {
    try {
      this.view.setLoading(true);
      const clientExists = await ClientService.getClientById(clientId);
      if (!clientExists) {
        throw new Error("Client non trouvé");
      }
      await ClientService.deleteClient(clientId);
      this.view.showSuccess("Client supprimé avec succès");
      await this.loadClients();
    } catch (error) {
      this.view.showError("Erreur", error.message || "Impossible de supprimer le client");
    } finally {
      this.view.setLoading(false);
    }
  }
}