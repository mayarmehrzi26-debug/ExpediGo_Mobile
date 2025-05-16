import { LivraisonModel } from "../models/LivraisonModel";

export interface Commande {
  id: string;
  origin: string;
  livreur:string;
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
  
      // Récupérer le produit
      let product = null;
      if (commandeDoc.product) {
        product = await this.model.getProductById(commandeDoc.product);
      }
  
      // Récupérer le client/destinataire
      let client = null;
      if (commandeDoc.clientId) {
        client = await this.model.getClientById(commandeDoc.clientId);
      }
      let livreur = null;
      if (commandeDoc.assignedTo) {
        livreur = await this.model.getUserById(commandeDoc.assignedTo);
      }
      return {
        ...commandeDoc,
        expediteurName: expediteur?.name || "Expéditeur inconnu",
        expediteurPhone: expediteur?.phone || "",
        productName: product?.name || "Produit inconnu",
        productDescription: product?.description || "",
        destination: client?.address || "Adresse inconnue", // On conserve la destination
        clientName: client?.name || "Destinataire inconnu", // Pour référence si besoin
        clientPhone: client?.phone || "",
        livreurName: livreur?.name || "Non assigné",
        livreurPhone: livreur?.phone || "",
        expediteurId: commandeDoc.createdBy,
        assignedTo: commandeDoc.assignedTo

      };
    } catch (error) {
      console.error("Erreur fetchCommandeDetails:", error);
      return null;
    }
  }
}