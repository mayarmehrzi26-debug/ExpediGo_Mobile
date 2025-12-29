import { firebaseAuth } from "../../../FirebaseConfig";
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
      const unsubscribe = firebaseAuth.onAuthStateChanged(() => {});
      const randomPassword = Math.random().toString(36).slice(-8);

      // Essayez d'abord d'ajouter le client
      const { id: clientId } = await ClientService.addClientWithEmail({
        name: clientData.name,
        phone: clientData.phone,
        email: clientData.email,
        address: clientData.address,
        latitude: clientData.latitude,
        longitude: clientData.longitude,
        createdAt: new Date().toISOString()
      }, randomPassword);

      // Si l'ajout réussit, créez le compte utilisateur
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
    
  } catch (error: any) {
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

  
