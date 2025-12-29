import { firebaseAuth } from "../../../FirebaseConfig";
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

    // 1. Sauvegarde de l'utilisateur admin actuel
    const currentUser = firebaseAuth.currentUser;
    const currentUserToken = currentUser ? await currentUser.getIdToken() : null;

    // 2. Génération du mot de passe temporaire
    const tempPassword = Math.random().toString(36).slice(-8);

    // 3. Création du client dans Firestore
    const newClientId = await ClientService.addClient({
      ...clientData,
      createdAt: new Date().toISOString(),
    });

    // 4. Création du compte utilisateur
    const newUser = await ClientService.createUserAccount(
      clientData.email,
      tempPassword,
      newClientId
    );

    // 5. Envoi de l'email de bienvenue (sans bloquer le processus si ça échoue)
    try {
      await ClientService.addClientWithEmail(
        {
          ...clientData,
          createdAt: new Date().toISOString(),
        },
        tempPassword
      );
    } catch (emailError) {
      console.warn("L'email n'a pas pu être envoyé:", emailError);
      // On ne montre pas d'erreur à l'utilisateur pour ne pas bloquer le processus
    }

    // 6. Reconnexion de l'admin si nécessaire
    if (currentUser && currentUserToken) {
      await firebaseAuth.signOut();
      await firebaseAuth.signInWithCustomToken(currentUserToken);
    }

    // 7. Affichage du succès
    showSuccess(
      'Succès',
      'Le client a été ajouté avec succès. Un email de bienvenue a été envoyé.'
    );

    // Retourner les données pour une utilisation éventuelle
    return {
      clientId: newClientId,
      userId: newUser.uid
    };

  } catch (error: any) {
    console.error('Erreur complète:', error);
    
    let errorMessage = "Une erreur s'est produite lors de l'ajout du client";
    
    // Gestion des erreurs spécifiques Firebase
    if (error.code) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = "Un compte existe déjà avec cette adresse email";
          break;
        case 'auth/invalid-email':
          errorMessage = "L'adresse email n'est pas valide";
          break;
        case 'auth/weak-password':
          errorMessage = "Le mot de passe doit contenir au moins 6 caractères";
          break;
        case 'permission-denied':
          errorMessage = "Vous n'avez pas les permissions nécessaires";
          break;
      }
    }

    showError('Erreur', errorMessage);
    throw error; // Propager l'erreur pour une gestion supplémentaire si nécessaire

  } finally {
    setLoading(false);
  }
}
}