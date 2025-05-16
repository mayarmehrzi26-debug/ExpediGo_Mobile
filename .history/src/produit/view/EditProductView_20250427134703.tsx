import { ProductModel } from "../model/ProductModel";
import { getAuth } from "firebase/auth";

export class EditProductPresenter {
  private view: EditProductView;

  constructor(view: EditProductView) {
    this.view = view;
  }

  async updateProduct(
    id: string,
    name: string,
    amount: string,
    description: string,
    imageUri: string | null
  ): Promise<void> {
    if (!name || !amount || !description) {
      this.view.showValidationError();
      return;
    }

    try {
      this.view.setLoading(true);
      
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        throw new Error("Utilisateur non connecté");
      }

      await ProductModel.updateProduct(id, {
        name,
        amount: parseFloat(amount.replace(",", ".")),
        description,
        imageUrl: imageUri
      });

      this.view.onUpdateSuccess();
    } catch (error) {
      console.error("Error updating product:", error);
      this.view.onUpdateError(error);
    } finally {
      this.view.setLoading(false);
    }
  }
}

export interface EditProductView {
  setLoading(loading: boolean): void;
  showValidationError(): void;
  onUpdateSuccess(): void;
  onUpdateError(error: unknown): void;
}