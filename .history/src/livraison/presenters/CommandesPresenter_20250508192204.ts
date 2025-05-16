import { LivraisonModel } from "../models/Livraison";

export class CommandesPresenter {
  private model: LivraisonModel;

  constructor() {
    this.model = new LivraisonModel();
  }

  async fetchCommandes(uid: string): Promise<any[]> {
    try {
      // 1. Récupérer les données initiales
      const { clients, adresses } = await this.model.fetchInitialData();
      
      // 2. Trouver le client correspondant
      const client = clients.find(c => c.value === uid);
      if (!client) {
        console.log("Client non trouvé");
        return [];
      }

      // 3. Créer une map des adresses
      const adressesMap = new Map(
        adresses.map(addr => [addr.value, addr.label])
      );

      // 4. Récupérer les livraisons
      const livraisonsQuery = query(
        collection(firebasestore, "livraisons"),
        where("client", "==", client.value)
      );
      const snapshot = await getDocs(livraisonsQuery);

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          origin: adressesMap.get(data.address) || data.address,
          destination: client.address || "Adresse inconnue",
          status: data.status || "Non traité",
          date: data.createdAt?.toDate()?.toLocaleDateString() || "Date inconnue",
          clientName: client.label || "",
          clientPhone: client.phone || ""
        };
      });

    } catch (error) {
      console.error("Erreur:", error);
      return [];
    }
  }
}