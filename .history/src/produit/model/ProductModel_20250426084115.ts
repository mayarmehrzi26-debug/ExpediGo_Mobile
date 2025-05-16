import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { firebasestore } from "../../../FirebaseConfig";

export interface Product {
  name: string;
  amount: number;
  description: string;
  imageUrl: string | null;
  createdAt: Date;
}

export class ProductModel {
  static async addProduct(product: Omit<Product, 'createdAt'>): Promise<void> {
    try {
      await addDoc(collection(firebasestore, "products"), {
        ...product,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error adding product:", error);
      throw error;
    }
  }
}