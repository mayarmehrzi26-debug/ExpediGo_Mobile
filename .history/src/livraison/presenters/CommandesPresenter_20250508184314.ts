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
  
      const adressesMap = await this.model.getAdressesMap();
      const livraisons = await this.model.getCommandesByClient(client.id);
  
      return livraisons
        .filter(l => l.status !== "Supprimée")
        .map(l => {
          // Debug
          console.log("Données brutes - origin:", l.origin, "type:", typeof l.origin);
          
          return {
            id: l.id,
            origin: this.formatAdresse(adressesMap, l.adrd),
            destination: this.formatAdresse(adressesMap, client.address) || client.address || "Adresse inconnue",
            status: l.status || "Non traité",
            date: l.createdAt?.toDate?.().toLocaleDateString() || "Date inconnue",
            clientName: client.name || "",
            clientPhone: client.phone || ""
          };
        });
    } catch (error) {
      console.error("Error:", error);
      return [];
    }
  }
  private formatAdresse(adressesMap: Map<string, any>, adresseRef: string): string {
    // Si vide ou undefined
    if (!adresseRef || adresseRef.trim() === "") {
      return "Adresse non spécifiée";
    }
  
    // Si c'est déjà une adresse formatée (contient une virgule)
    if (adresseRef.includes(',')) {
      return adresseRef;
    }
  
    // Si c'est une référence à une adresse
    const adresseData = adressesMap.get(adresseRef);
    if (!adresseData) {
      console.warn("Référence d'adresse introuvable:", adresseRef);
      return "Adresse inconnue";
    }
  
    // Construction de l'adresse
    const adresseParts = [
      adresseData.rue,
      adresseData.ville,
      adresseData.pays
    ].filter(part => part && part.trim() !== "");
  
    return adresseParts.join(', ') || "Adresse incomplète";
  }
}