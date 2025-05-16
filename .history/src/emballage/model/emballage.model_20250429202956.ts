import { updateDoc,addDoc, collection, serverTimestamp, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { firebasestore } from "../../../FirebaseConfig";
import { getAuth } from "firebase/auth";

export interface EmballageSize {
  id: string;
  label: string;
  dimensions: string;
  price: number;
  available: boolean;
}

export interface EmballageOrder {
  id?: string;
  size: string;
  quantity: number;
  price: number;
  totalPrice: number;
  status: "non traité" | "en cours" | "traité";
  timestamp: any;
  userId: string;
  qrCodeUrl?: string;
}

export const sizes: EmballageSize[] = [
  {
    id: "petit",
    label: "Petit",
    dimensions: "30x30 (cm)",
    price: 250,
    available: true,
  },
  {
    id: "large",
    label: "Large",
    dimensions: "40x50 (cm)",
    price: 300,
    available: true,
  },
  { id: "moyen", label: "Moyen", dimensions: "", price: 0, available: false },
  {
    id: "xlarge",
    label: "Extra large",
    dimensions: "",
    price: 0,
    available: false,
  },
];

export class EmballageModel {
  async createOrder(orderData: Omit<EmballageOrder, 'id' | 'timestamp'>): Promise<string> {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error("Utilisateur non connecté");
      }

      const orderWithMetadata: Omit<EmballageOrder, 'id'> = {
        ...orderData,
        userId: user.uid,
        timestamp: serverTimestamp(),
        qrCodeUrl: this.generateQRCode(),
      };

      const docRef = await addDoc(collection(firebasestore, "emballageOrders"), orderWithMetadata);
      return docRef.id;
    } catch (error) {
      console.error("Erreur création commande:", error);
      throw error;
    }
  }

  async getUserOrders(userId: string, callback: (orders: EmballageOrder[]) => void) {
    const q = query(
      collection(firebasestore, "emballageOrders"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );

    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EmballageOrder[];
      callback(orders);
    });
  }

  async updateOrderStatus(orderId: string, status: EmballageOrder['status']) {
    await updateDoc(doc(firebasestore, "emballageOrders", orderId), {
      status,
      updatedAt: serverTimestamp()
    });
  }

  private generateQRCode(): string {
    // Implémentez la génération de QR code
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${Math.random().toString(36).substring(2)}`;
  }
}