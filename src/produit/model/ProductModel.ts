import { addDoc, collection, deleteDoc, doc, getDocs, query, where, serverTimestamp, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { firebasestore } from "../../../FirebaseConfig";

export interface Product {
  id: string;
  name: string;
  amount: number;
  description: string;
  imageUrl: string | null;
  createdAt: Date;
  createdBy: string; // Ajout du champ createdBy
}

export class ProductModel {
  static async addProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<void> {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        throw new Error("Utilisateur non connecté");
      }

      await addDoc(collection(firebasestore, "products"), {
        ...product,
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error adding product:", error);
      throw error;
    }
  }

  static async getProducts(): Promise<Product[]> {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      return [];
    }

    try {
      const q = query(
        collection(firebasestore, "products"),
        where("createdBy", "==", currentUser.uid)
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
    try {
      await deleteDoc(doc(firebasestore, "products", id));
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  }

  static async updateProduct(id: string, productData: Partial<Product>): Promise<void> {
    try {
      await updateDoc(doc(firebasestore, "products", id), {
        ...productData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  }
}