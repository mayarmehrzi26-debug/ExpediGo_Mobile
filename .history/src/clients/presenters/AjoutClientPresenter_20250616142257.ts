import { ClientService } from '../services/ClientService';

interface PresenterCallbacks {
  setLoading: (isLoading: boolean) => void;
  showError: (title: string, message: string) => void;
  showSuccess: (title: string, message: string) => void;
}

export class AjoutClientPresenter {
  private callbacks: PresenterCallbacks;

  constructor(callbacks: PresenterCallbacks) {
    this.callbacks = callbacks;
  }

  async handleSubmit(clientData: {
    name: string;
    phone: string;
    email: string;
    latitude: number;
    longitude: number;
    address: string;
  }) {
    const { setLoading, showError, showSuccess } = this.callbacks;

    try {
      setLoading(true);

      // 1. Création du client dans Firestore
      const newClientId = await ClientService.addClient({
        ...clientData,
        createdAt: new Date().toISOString(),
      });

      // 2. Génération d'un mot de passe temporaire
      const tempPassword = Math.random().toString(36).slice(-8);

      // 3. Création du compte utilisateur
      await ClientService.createUserAccount(
        clientData.email,
        tempPassword,
        newClientId
      );

      // 4. Envoi de l'email de bienvenue (via la nouvelle méthode)
      await ClientService.addClientWithEmail(
        {
          ...clientData,
          createdAt: new Date().toISOString(),
        },
        tempPassword
      );

      showSuccess(
        'Succès',
        'Le client a été ajouté avec succès et un email de bienvenue a été envoyé.'
      );
    } catch (error) {
      console.error('Erreur lors de la création du client:', error);
      
      let errorMessage = "Une erreur s'est produite lors de l'ajout du client";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      showError('Erreur', errorMessage);
    } finally {
      setLoading(false);
    }
  }
}