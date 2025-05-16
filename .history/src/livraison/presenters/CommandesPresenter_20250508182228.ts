import { LivraisonModel, Commande } from "../models/LivraisonModel";

export class CommandesPresenter {
  private model: LivraisonModel;

  constructor() {
    this.model = new LivraisonModel();
  }

  async fetchCommandes(uid: string): Promise<Commande[]> {
    try {
      // 1. Récupérer le client
      const client = await this.model.getClientByUserId(uid);
      if (!client) {
        console.log("Aucun client trouvé");
        return [];
      }

      // 2. Récupérer les adresses
      const adressesMap = await this.model.getAdressesMap();

      // 3. Récupérer les commandes
      const livraisons = await this.model.getCommandesByClient(client.id);
      
      // 4. Formater les données
      return livraisons
        .filter(l => l.status !== "Supprimée")
        .map(l => ({
          id: l.id,
          origin: this.formatAdresse(adressesMap, l.address),
          destination: this.formatAdresse(adressesMap, client.address) || "Adresse inconnue",
          status: l.status || "Non traité",
          date: l.createdAt?.toDate?.().toLocaleDateString() || "Date inconnue",
          clientName: client.name || "",
          clientPhone: client.phone || ""
        }));
    } catch (error) {
      console.error("Error in fetchCommandes:", error);
      return [];
    }
  }

  private formatAdresse(adressesMap: Map<any, any>, adresseId: string): string {
    if (!adresseId) return "Adresse inconnue";
    
    const adresseData = adressesMap.get(adresseId);
    if (!adresseData) return adresseId; // Si c'est déjà une string
    
    return `${adresseData.rue }, ${adresseData.ville || ''}, ${adresseData.pays || ''}`;
  }
}