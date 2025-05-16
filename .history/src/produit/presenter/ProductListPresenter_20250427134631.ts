import { ProductModel } from "../model/ProductModel";

export class ProductListPresenter {
  private view: ProductListView;

  constructor(view: ProductListView) {
    this.view = view;
  }

  async loadProducts(): Promise<void> {
    try {
      const products = await ProductModel.getProducts();
      this.view.displayProducts(products);
    } catch (error) {
      console.error("Error loading products:", error);
      this.view.showError("Erreur lors du chargement des produits");
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      await ProductModel.deleteProduct(id);
      this.view.showSuccess("Produit supprimé avec succès");
      await this.loadProducts(); // Recharger la liste après suppression
    } catch (error) {
      console.error("Error deleting product:", error);
      this.view.showError("Erreur lors de la suppression du produit");
    }
  }
}

export interface ProductListView {
  displayProducts(products: Product[]): void;
  showError(message: string): void;
  showSuccess(message: string): void;
}