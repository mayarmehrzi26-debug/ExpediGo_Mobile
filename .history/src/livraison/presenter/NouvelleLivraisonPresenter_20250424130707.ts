import { INouvelleLivraisonPresenter, INouvelleLivraisonView } from "../contracts/NouvelleLivraisonContracts";
import { FirebaseService } from "../model/services/FirebaseService";
import { DropdownOption } from "../model/entities/Livraison";
import { Produit } from "../model/entities/Produit";

export class NouvelleLivraisonPresenter implements INouvelleLivraisonPresenter {
  private view: INouvelleLivraisonView;
  private produits: Produit[] = [];

  constructor(view: INouvelleLivraisonView) {
    this.view = view;
  }

  async loadInitialData(): Promise<void> {
    try {
      const [produits, clients, adresses, defaultStatus] = await Promise.all([
        FirebaseService.fetchProducts(),
        FirebaseService.fetchClients(),
        FirebaseService.fetchAdresses(),
        FirebaseService.fetchDefaultStatus(),
      ]);

      this.produits = produits;
      
      // Conversion en DropdownOption pour la vue
      this.view.setProducts(produits.map(p => ({
        label: p.name,
        value: p.id,
        image: p.imageUrl,
        price: p.amount
      })));

      this.view.setClients(clients.map(c => ({
        label: c.name,
        value: c.id
      })));

      this.view.setAddress(adresses.map(a => ({
        label: a,
        value: a
      })));

      this.view.setDefaultStatus(defaultStatus);
    } catch (error) {
      console.error("Erreur chargement données:", error);
      this.view.showError("Erreur lors du chargement des données");
    }
  }

  // ... (autres méthodes restent similaires mais utilisent les entités)
}