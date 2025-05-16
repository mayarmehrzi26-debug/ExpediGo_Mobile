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
  
      const livraisons = await this.model.getCommandesByClient(client.id);
  
      return livraisons
        .filter(l => l.status !== "Supprimée")
        .map(l => ({
          id: l.id,
          origin: l.address || "Adresse non spécifiée", // Utilisation directe du champ address
          destination: client.address || "Adresse inconnue", // Adresse du client
          status: l.status || "Non traité",
          date: l.createdAt?.toDate?.().toLocaleDateString() || "Date inconnue",
          clientName: client.name || "",
          clientPhone: client.phone || ""
        }));
    } catch (error) {
      console.error("Error:", error);
      return [];
    }
  }
  
  private formatAdresse(adressesMap: Map<string, any>, adresseId: string): string {
    // Si l'ID est vide ou non défini
    if (!adresseId) return "Adresse non spécifiée";
  
    // Si c'est déjà une adresse complète (contient une virgule)
    if (typeof adresseId === 'string' && adresseId.includes(',')) {
      return adresseId;
    }
  
    // Récupération des données d'adresse
    const adresseData = adressesMap.get(adresseId);
    if (!adresseData) {
      console.warn("Aucune adresse trouvée pour ID:", adresseId);
      return "Adresse inconnue";
    }
  
    // Construction de l'adresse formatée
    const adresseParts = [
      adresseData.rue,
      adresseData.ville,
      adresseData.pays
    ].filter(part => part && part.trim() !== "");
  
    return adresseParts.join(', ') || "Adresse incomplète";
  }
}