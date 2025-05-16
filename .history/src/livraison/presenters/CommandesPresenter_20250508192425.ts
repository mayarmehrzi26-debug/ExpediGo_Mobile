import { LivraisonModel } from "../models/LivraisonModel";
export interface Commande {
  id: string;
  origin: string;
  destination: string;
  status: string;
  date: string;
  clientName: string;
  clientPhone: string;
}

export class CommandesPresenter {
  private model: LivraisonModel;

  constructor() {
    this.model = new LivraisonModel();
  }
  async fetchCommandes(uid: string): Promise<Commande[]> {
    try {
      const client = await this.model.getClientByUserId(uid);
      if (!client) return [];
  
      const livraisons = await this.model.getCommandesWithAdresses(client.id);
  
      // Adresse du client (déjà formatée dans le modèle)
      const clientFullAddress = client.address || "Adresse inconnue";
  
      return livraisons
        .filter(l => l.status !== "Supprimée")
        .map(l => ({
          id: l.id,
          origin: l.address, // Utilise directement l'adresse formatée
          destination: clientFullAddress,
          status: l.status || "Non traité",
          date: l.createdAt?.toDate?.().toLocaleDateString() || "Date inconnue",
          clientName: client.name || "",
          clientPhone: client.phone || ""
        }));
  
    } catch (error) {
      console.error("Erreur fetchCommandes:", error);
      return [];
    }
  }
}