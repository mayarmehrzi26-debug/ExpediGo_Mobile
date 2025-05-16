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
      // 1. Get client data
      const client = await this.model.getClientByUserId(uid);
      if (!client) {
        console.log("No client found for user:", uid);
        return [];
      }
  
      // 2. Get addresses map
      const adressesMap = await this.model.getAdressesMap();
  
      // 3. Get client's deliveries
      const livraisons = await this.model.getCommandesByClient(client.id);
  
      // 4. Format data
      return livraisons
        .filter(l => l.status !== "Supprimée")
        .map(l => {
          // Debug logging
          console.log("Données de livraison:", l);
          console.log("Map des adresses:", adressesMap);
          
          return {
            id: l.id,
            origin: this.formatAdresse(adressesMap, l.origin), // Changé de l.address à l.origin
            destination: this.formatAdresse(adressesMap, client.address) || client.address || "Adresse inconnue",
            status: l.status || "Non traité",
            date: l.createdAt?.toDate?.().toLocaleDateString() || "Date inconnue",
            clientName: client.name || "",
            clientPhone: client.phone || ""
          };
        });
    } catch (error) {
      console.error("Error fetching commandes:", error);
      return [];
    }
  }
  private formatAdresse(adressesMap: Map<string, any>, adresseId: string): string {
    if (!adresseId) return "Adresse inconnue";
    
    const adresseData = adressesMap.get(adresseId);
    if (!adresseData) return adresseId;
    
    return `${adresseData.rue || ''}, ${adresseData.ville || ''}, ${adresseData.pays || ''}`;
  }
}