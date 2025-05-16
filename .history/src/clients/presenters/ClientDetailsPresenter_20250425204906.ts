import { ClientService } from "../models/ClientModel";

export interface ClientDetailsView {
  setClient(client: any): void;
  setLoading(loading: boolean): void;
  showError(title: string, message: string): void;
  navigateBack(): void;
}

export class ClientDetailsPresenter {
  private view: ClientDetailsView;
  
  constructor(view: ClientDetailsView) {
    this.view = view;
  }

  async loadClient(clientId: string) {
    try {
      this.view.setLoading(true);
      const client = await ClientService.getClientById(clientId);
      
      if (!client) {
        throw new Error("Client non trouvé");
      }
      
      this.view.setClient(client);
    } catch (error) {
      this.view.showError("Erreur", error.message || "Impossible de charger les détails du client");
      this.view.navigateBack();
    } finally {
      this.view.setLoading(false);
    }
  }
}