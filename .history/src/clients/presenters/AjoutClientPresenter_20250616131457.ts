import { ClientService } from "../models/ClientModel";

export interface AjoutClientView {
  setLoading(loading: boolean): void;
  showError(title: string, message: string): void;
  showSuccess(title: string, message: string): void;
}

export class AjoutClientPresenter {
  private view: AjoutClientView;
  
  constructor(view: AjoutClientView) {
    this.view = view;
  }

 async handleSubmit(clientData: {
    name: string;
    phone: string;
    email: string;
    latitude: number;
    longitude: number;
    address: string;
  }) {
    if (!clientData.name || !clientData.phone || !clientData.email || 
        !clientData.latitude || !clientData.longitude) {
      this.view.showError("Erreur", "Veuillez remplir tous les champs");
      return;
    }

     try {
    this.view.setLoading(true);
    const randomPassword = Math.random().toString(36).slice(-8);

    // Ajout du client
    const { id: clientId } = await ClientService.addClientWithEmail({
      // ... données client inchangées
    }, randomPassword);

    // Création du compte (sera automatiquement déconnecté)
    try {
      await ClientService.createUserAccount(
        clientData.email, 
        randomPassword, 
        clientId
      );
      this.view.showSuccess("Succès", "Client ajouté avec succès.");
    } catch (userError) {
      console.warn("Création de compte échouée:", userError);
      this.view.showSuccess("Succès", "Client ajouté avec succès (compte utilisateur non créé).");
    }
      console.error("Erreur principale:", error);
      let errorMessage = "Une erreur est survenue lors de l'ajout du client";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Cet email est déjà utilisé";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Email invalide";
      } else if (error.message.includes("serveur")) {
        errorMessage = "Problème de connexion au serveur";
      }
      
      this.view.showError("Erreur", errorMessage);
    } finally {
      this.view.setLoading(false);
    }
  }
}
  
