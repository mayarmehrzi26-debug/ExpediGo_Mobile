import { collection, doc, getDoc, getDocs, Timestamp, updateDoc } from "firebase/firestore";
import { firebasestore } from "../FirebaseConfig";

export interface Transaction {
  id: string;
  customerName: string;
  amount: number;
  packageCount: number;
  status: "Traitée" | "En cours" | "Annulée";
  paymentMethod: "Espèces" | "Virement";
  date: string;
  time: string;
}

export interface Balance {
  available: number;
  pending: number;
}

export class CashModel {
  static async getBalance(): Promise<Balance> {
    const balanceRef = doc(firebasestore, "solde", "total");
    const balanceDoc = await getDoc(balanceRef);
    
    if (balanceDoc.exists()) {
      return {
        available: balanceDoc.data().available || 0,
        pending: balanceDoc.data().pending || 0
      };
    }
    return { available: 0, pending: 0 };
  }

  static async getTransactions(): Promise<Transaction[]> {
    const transactions: Transaction[] = [];
    const ordersSnapshot = await getDocs(collection(firebasestore, "Orders"));

    for (const orderDoc of ordersSnapshot.docs) {
      const orderData = orderDoc.data();
      const clientRef = doc(firebasestore, "clients", orderData.client);
      const clientDoc = await getDoc(clientRef);

      const createdAt = orderData.createdAt instanceof Timestamp 
        ? orderData.createdAt.toDate() 
        : new Date();

      transactions.push({
        id: orderDoc.id,
        customerName: clientDoc.exists() ? clientDoc.data().name : "Client inconnu",
        amount: orderData.totalAmount || 0,
        packageCount: orderData.quantity || 0,
        status: orderData.status || "En cours",
        paymentMethod: orderData.paymentMethod || "Espèces",
        date: createdAt.toLocaleDateString(),
        time: createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      });
    }

    return transactions;
  }

  static async requestPayment(amount: number): Promise<void> {
    if (amount <= 0) throw new Error("Montant invalide");
    
    const balanceRef = doc(firebasestore, "solde", "total");
    await updateDoc(balanceRef, {
      pending: 0,
      available: 0
    });
  }
}