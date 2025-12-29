import { ClientService } from "../models/ClientModel";

export interface AjoutClientView {
  setLoading(loading: boolean): void;
  showError(title: string, message: string): void;
  showSuccess(title: string, message: string, callback?: () => void): void;
  navigateBack(): void;
}

export class AjoutClientPresenter {
  constructor(private view: AjoutClientView) {}

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

      // Étape 1: Ajouter le client ou l'associer s'il existe déjà
      const { id: clientId, isNew } = await ClientService.addClientWithEmail(
        {
          name: clientData.name,
          phone: clientData.phone,
          email: clientData.email,
          address: clientData.address,
          latitude: clientData.latitude,
          longitude: clientData.longitude,
          createdAt: new Date().toISOString()
        },
        randomPassword
      );

      // Étape 2: Si c'est un nouveau client, créer son compte utilisateur
      if (isNew) {
        await ClientService.createUserAccount(
          clientData.email,
          randomPassword,
          clientId
        );
      }

      this.view.showSuccess(
        "Succès",
        isNew 
          ? "Client ajouté avec succès et compte créé"
          : "Client existant associé à votre compte",
        () => this.view.navigateBack()
      );
    } catch (error: any) {
      let errorMessage = "Une erreur est survenue";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Cet email est déjà utilisé pour un compte utilisateur";
      } else if (error.message.includes("email")) {
        errorMessage = "Email invalide ou déjà utilisé";
      }
      
      this.view.showError("Erreur", errorMessage || error.message);
    } finally {
      this.view.setLoading(false);
    }
  }
}