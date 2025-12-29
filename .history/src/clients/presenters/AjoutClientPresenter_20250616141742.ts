import { createClient, createUserAccount, sendWelcomeEmail } from '../models/ClientModel';

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

      // 1. Création du client dans la collection 'clients'
      const newClient = await createClient(clientData);

      // 2. Création du compte utilisateur
      const newUser = await createUserAccount({
        email: clientData.email,
        role: 'client',
        clientId: newClient.id,
      });

      // 3. Envoi de l'email de bienvenue
      await sendWelcomeEmail(
        clientData.email,
        clientData.name,
        newUser.password!, // Mot de passe temporaire généré
        clientData.address
      );

      showSuccess(
        'Succès',
        'Le client a été ajouté avec succès et un email de bienvenue a été envoyé.'
      );
    } catch (error) {
      console.error('Erreur lors de la création du client:', error);
      
      let errorMessage = "Une erreur s'est produite";
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