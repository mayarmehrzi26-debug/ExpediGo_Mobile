import { getAuth } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, getDocs, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { firebasestore } from "../../../FirebaseConfig";

export interface Product {
  id: string;
  name: string;
  amount: number;
  description: string;
  imageUrl: string | null;
  createdAt: Date;
  createdBy: string; // Ajout du propriétaire
}

export class ProductModel {
  static async addProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<void> {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) throw new Error("Utilisateur non connecté");

      await addDoc(collection(firebasestore, "products"), {
        ...product,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error adding product:", error);
      throw error;
    }
  }

  static async getProducts(): Promise<Product[]> {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) return [];

    try {
      const q = query(
        collection(firebasestore, "products"),
        where("createdBy", "==", user.uid)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      } as Product));
    } catch (error) {
      console.error("Error getting products:", error);
      throw error;
    }
  }

  static async deleteProduct(id: string): Promise<void> {
    await deleteDoc(doc(firebasestore, "products", id));
  }

  static async updateProduct(id: string, productData: Partial<Product>): Promise<void> {
    await updateDoc(doc(firebasestore, "products", id), productData);
  }
}