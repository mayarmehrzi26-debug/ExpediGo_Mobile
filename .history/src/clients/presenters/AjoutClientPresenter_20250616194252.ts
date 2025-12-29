import { ClientService } from "../models/ClientModel";

export interface AjoutClientView {
  setLoading(loading: boolean): void;
  showError(title: string, message: string): void;
  showSuccess(title: string, message: string, callback?: () => void): void;
  navigateBack(): void;
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

      const { id: clientId, emailSent } = await ClientService.addClientWithEmail({
        name: clientData.name,
        phone: clientData.phone,
        email: clientData.email,
        address: clientData.address,
        latitude: clientData.latitude,
        longitude: clientData.longitude,
        createdAt: new Date().toISOString()
      }, randomPassword);

      if (!emailSent) {
        throw new Error("L'email n'a pas pu être envoyé");
      }

      await ClientService.createUserAccount(
        clientData.email, 
        randomPassword, 
        clientId
      );

      this.view.showAutoDismissSuccess(
        "Succès", 
        `Client ajouté avec succès.\n\nIdentifiants de connexion :\nEmail : ${clientData.email}\nMot de passe : ${randomPassword}`,
        5000, // 5 secondes
        () => this.view.navigateBack()
      );
      
    } catch (error: any) {
      let errorMessage = "Une erreur est survenue";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Cet email est déjà utilisé";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Email invalide";
      }
      
      this.view.showError("Erreur", errorMessage);
    } finally {
      this.view.setLoading(false);
    }
  }
}