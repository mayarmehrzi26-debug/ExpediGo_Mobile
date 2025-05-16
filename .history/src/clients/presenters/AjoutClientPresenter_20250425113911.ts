import { Client, ClientService } from "../models/ClientModel";

export class AjoutClientPresenter {
  private view: AjoutClientView;
  
  constructor(view: AjoutClientView) {
    this.view = view;
  }

  async handleSubmit(clientData: Omit<Client, "id" | "createdAt">) {
    if (!clientData.name || !clientData.phone || !clientData.email || !clientData.address) {
      this.view.showError("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    try {
      this.view.setLoading(true);

      // 1. Création du client
      const clientId = await ClientService.addClient({
        ...clientData,
        createdAt: new Date().toISOString()
      });

      // 2. Création du compte utilisateur
      // Génération d'un mot de passe aléatoire
      const randomPassword = Math.random().toString(36).slice(-8);
      await ClientService.createUserAccount(clientData.email, randomPassword, clientId);

      this.view.showSuccess(
        "Succès", 
        "Client ajouté avec succès. Un email de connexion a été envoyé au client.",
        () => this.view.navigateBack()
      );
    } catch (error: any) {
      console.error("Erreur:", error);
      let errorMessage = "Une erreur est survenue";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Cet email est déjà utilisé par un autre compte";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "L'adresse email est invalide";
      }
      
      this.view.showError("Erreur", errorMessage);
    } finally {
      this.view.setLoading(false);
    }
  }
}

export interface AjoutClientView {
  setLoading(loading: boolean): void;
  showError(title: string, message: string): void;
  showSuccess(title: string, message: string, callback?: () => void): void;
  navigateBack(): void;
}