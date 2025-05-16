import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { firebasestore } from "../../../FirebaseConfig";

export interface Product {
  id: string;
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
  static async getProducts(): Promise<Product[]> {
    const querySnapshot = await getDocs(collection(firebasestore, "products"));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    } as Product));
  }

  static async deleteProduct(id: string): Promise<void> {
    await deleteDoc(doc(firebasestore, "products", id));
  }
}