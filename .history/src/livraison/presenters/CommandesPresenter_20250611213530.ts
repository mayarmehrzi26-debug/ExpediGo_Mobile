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
      const commande = await this.model.getCommandeById(commandeId);
      if (!commande) return null;

      // Récupérer l'expéditeur
      let expediteur = null;
      if (commande.createdBy) {
        expediteur = await this.model.getUserById(commande.createdBy);
      }

      // Récupérer les produits
      let products = [];
      if (Array.isArray(commande.products)) {
        products = await Promise.all(
          commande.products.map(async (p) => {
            const productDetails = await this.model.getProductById(p.productId || p.id);
            return {
              id: p.productId || p.id,
              productId: p.productId || p.id, // Double référence pour compatibilité
              name: productDetails?.name || 'Produit inconnu',
              description: productDetails?.description || '',
              quantity: p.quantity || 1,
              price: p.price || productDetails?.price || 0,
              image: productDetails?.imageUrl || null
            };
          })
        );
      }

      // Récupérer le client/destinataire
      let client = null;
      if (commande.clientId) {
        client = await this.model.getClientById(commande.clientId);
      }

      let livreur = null;
      if (commande.assignedTo) {
        livreur = await this.model.getUserById(commande.assignedTo);
      }

      return {
        ...commande,
        expediteurName: expediteur?.name || "Expéditeur inconnu",
        expediteurPhone: expediteur?.phone || "",
        products,
        destination: client?.address || "Adresse inconnue",
        clientName: client?.name || "Destinataire inconnu",
        clientPhone: client?.phone || "",
        livreurName: livreur?.name || "Non assigné",
        livreurPhone: livreur?.phone || "",
        expediteurId: commande.createdBy,
        assignedTo: commande.assignedTo
      };
    } catch (error) {
      console.error("Erreur fetchCommandeDetails:", error);
      return null;
    }
  }
}