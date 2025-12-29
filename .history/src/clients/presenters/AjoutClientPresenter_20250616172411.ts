import { ClientService } from "../services/ClientService";

interface PresenterCallbacks {
  setLoading: (isLoading: boolean) => void;
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  resetForm: () => void;
}

export class AjoutClientPresenter {
  constructor(private callbacks: PresenterCallbacks) {}

  async handleSubmit(clientData: {
    name: string;
    phone: string;
    email: string;
    latitude: number;
    longitude: number;
    address: string;
  }) {
    const { setLoading, showError, showSuccess, resetForm } = this.callbacks;

    try {
      setLoading(true);
      
      // 1. Création du client
      const clientId = await ClientService.addClient({
        ...clientData,
        createdAt: new Date().toISOString()
      });

      // 2. Création du compte utilisateur
      const tempPassword = Math.random().toString(36).slice(-8);
      await ClientService.createUserAccount(
        clientData.email,
        tempPassword,
        clientId
      );

      // 3. Succès
      showSuccess("Client créé avec succès");
      resetForm();

    } catch (error: any) {
      console.error("Submission error:", error);
      showError(this.getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  private getErrorMessage(error: any): string {
    if (error.code === 'auth/email-already-in-use') {
      return "Cet email est déjà utilisé";
    }
    return "Erreur lors de la création du client";
  }
}