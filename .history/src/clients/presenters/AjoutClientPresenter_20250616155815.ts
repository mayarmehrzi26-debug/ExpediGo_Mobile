import { ClientService } from '../models/ClientModel';

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

    // 1. Génération du mot de passe temporaire
    const tempPassword = Math.random().toString(36).slice(-8);

    // 2. Création du client dans Firestore
    const newClientId = await ClientService.addClient({
      ...clientData,
      createdAt: new Date().toISOString(),
    });

    // 3. Création du compte utilisateur
    await ClientService.createUserAccount(
      clientData.email,
      tempPassword,
      newClientId
    );

    // 4. Envoi de l'email de bienvenue (optionnel)
    try {
      await ClientService.addClientWithEmail(
        {
          ...clientData,
          createdAt: new Date().toISOString(),
        },
        tempPassword
      );
    } catch (emailError) {
      console.warn("Échec d'envoi d'email:", emailError);
    }

    // 5. Affichage du message de succès persisté
    showSuccess(
      'Succès',
      'Client ajouté avec succès',
      () => {
        // Callback exécuté après fermeture de l'alerte
        setClientName("");
        setPhoneNumber("");
        setEmail("");
        setLocation(null);
      }
    );

  } catch (error: any) {
    console.error('Erreur:', error);
    let errorMessage = "Erreur lors de l'ajout du client";
    
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = "Email déjà utilisé";
    } else if (error.message) {
      errorMessage = error.message;
    }

    showError('Erreur', errorMessage);
  } finally {
    setLoading(false);
  }
}
}