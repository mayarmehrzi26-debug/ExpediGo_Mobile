import { addDoc, collection, doc, getDoc, getDocs, Timestamp } from "firebase/firestore";
import { firebasestore } from "../../../../FirebaseConfig";

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
  amount: number;
  availableAmount: number;
  pendingAmount: number;
  currency: string;
}
export interface WithdrawalRequest {
  id: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
}

export class CaisseModel {
  static async getBalance(): Promise<Balance> {
    const soldeRef = doc(firebasestore, "solde", "total");
    const soldeDoc = await getDoc(soldeRef);

    if (soldeDoc.exists()) {
      return {
        amount: soldeDoc.data().amount || 0,
        availableAmount: soldeDoc.data().availableAmount || 0,
        pendingAmount: soldeDoc.data().pendingAmount || 0,
        currency: "dt"
      };
    }
    return { amount: 0, availableAmount: 0, pendingAmount: 0, currency: "dt" };
  }

  static async getTransactions(): Promise<Transaction[]> {
    const ordersSnapshot = await getDocs(collection(firebasestore, "Orders"));
    const transactions: Transaction[] = [];

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

  static async requestPendingWithdrawal(): Promise<void> {
    const balance = await this.getBalance();
    
    if (balance.pendingAmount <= 0) {
      throw new Error("Aucun montant disponible pour le versement");
    }

    await addDoc(collection(firebasestore, "withdrawalRequests"), {
      amount: balance.pendingAmount,
      status: "pending",
      createdAt: Timestamp.now()
    });
  }
  static async getWithdrawalRequests(): Promise<WithdrawalRequest[]> {
    const snapshot = await getDocs(collection(firebasestore, "withdrawalRequests"));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      amount: doc.data().amount,
      status: doc.data().status,
      createdAt: doc.data().createdAt.toDate()
    }));
  }
  static async canRequestWithdrawal(): Promise<boolean> {
    const snapshot = await getDocs(collection(firebasestore, "withdrawalRequests"));
    const pendingRequests = snapshot.docs.filter(doc => 
      doc.data().status === "pending"
    );
    return pendingRequests.length === 0;
  }
}