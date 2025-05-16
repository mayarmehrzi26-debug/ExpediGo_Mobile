import * as ImagePicker from 'expo-image-picker';
import { ProductModel } from '../model/ProductModel';

export class AjoutProdPresenter {
  private view: AjoutProdView;

  constructor(view: AjoutProdView) {
    this.view = view;
  }

  async pickImage(): Promise<void> {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      this.view.showPermissionError();
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      this.view.setImage(result.assets[0].uri);
    }
  }

  async submitProduct(
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
      
      const productData = {
        name,
        amount: parseFloat(amount.replace(",", ".")),
        description,
        imageUrl: imageUri,
      };

      await ProductModel.addProduct(productData);
      this.view.onSubmitSuccess();
    } catch (error) {
      this.view.onSubmitError(error);
    } finally {
      this.view.setLoading(false);
    }
  }
}

export interface AjoutProdView {
  setImage(uri: string): void;
  setLoading(loading: boolean): void;
  showPermissionError(): void;
  showValidationError(): void;
  onSubmitSuccess(): void;
  onSubmitError(error: unknown): void;
}