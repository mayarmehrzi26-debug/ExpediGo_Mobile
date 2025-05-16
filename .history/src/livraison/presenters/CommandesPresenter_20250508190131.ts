import { doc, getDoc } from "firebase/firestore";
import { firebasestore } from "../../../FirebaseConfig";
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
  
      // Get client's full address
      let clientFullAddress = "Adresse inconnue";
      if (client.address) {
        const clientAddrDoc = await getDoc(doc(firebasestore, "adresses", client.address));
        clientFullAddress = clientAddrDoc.exists() 
          ? clientAddrDoc.data().address 
          : client.address;
      }
  
      return livraisons
        .filter(l => l.status !== "Supprimée")
        .map(l => {
          console.log("Final address mapping:", {
            id: l.id,
            originalAddress: l.address,
            finalOrigin: l.address // Already converted in model
          });
          
          return {
            id: l.id,
            origin: l.address, // Now contains full address
            destination: clientFullAddress,
            status: l.status || "Non traité",
            date: l.createdAt?.toDate?.().toLocaleDateString() || "Date inconnue",
            clientName: client.name || "",
            clientPhone: client.phone || ""
          };
        });
  
    } catch (error) {
      console.error("Error in fetchCommandes:", error);
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