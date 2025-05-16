import { LivraisonModel } from "../models/LivraisonModel";

export interface Commande {
  id: string;
  origin: string;
  destination: string;
  status: string;
  expediteur:string;
  date: string;
  clientName: string;
  clientPhone: string;
  clientId?: string; // Ajouté pour les détails
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
  
      return livraisons
        .filter(l => l.status !== "Supprimée")
        .map(l => ({
          id: l.id,
          expediteur:l.createdBy,
          origin: l.originAddress || "Adresse inconnue",
          destination: client.address || "Adresse inconnue",
          status: l.status || "Non traité",
          date: l.createdAt?.toDate?.().toLocaleDateString() || "Date inconnue",
          clientName: client.name || "",
          clientPhone: client.phone || "",
          clientId: client.id // Important pour les détails
        }));
    } catch (error) {
      console.error("Erreur fetchCommandes:", error);
      return [];
    }
  }

  async fetchCommandeDetails(commandeId: string): Promise<any> {
    try {
      const commandeDoc = await this.model.getCommandeById(commandeId);
      if (!commandeDoc) return null;
  
      // Récupérer l'expéditeur
      let expediteur = null;
      if (commandeDoc.createdBy) {
        expediteur = await this.model.getUserById(commandeDoc.createdBy);
      }
  
      // Récupérer le client
      const client = commandeDoc.clientId 
        ? await this.model.getClientById(commandeDoc.clientId)
        : null;
  
      // Récupérer le livreur
      let livreur = null;
      if (commandeDoc.livreurId) {
        livreur = await this.model.getClientById(commandeDoc.livreurId);
      }
  
      return {
        ...commandeDoc,
        destination: client?.address || "Adresse inconnue",
        clientName: client?.name || "Client inconnu",
        clientPhone: client?.phone || "",
        livreurName: livreur?.name || "Non assigné",
        expediteurName: expediteur?.name || "Expéditeur inconnu",
        expediteurPhone: expediteur?.phone || ""
      };
    } catch (error) {
      console.error("Erreur fetchCommandeDetails:", error);
      return null;
    }
  }
}