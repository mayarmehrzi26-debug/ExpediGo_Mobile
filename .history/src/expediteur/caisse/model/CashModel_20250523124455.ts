import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  
} from "firebase/firestore";
import { firebasestore } from "../../../../FirebaseConfig";

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: string;
  status: string;
  description: string;
  createdAt: Date;
}

export interface Balance {
  disponible: number;
  enAttente: number;
  currency: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  paymentMethod: "Espèces" | "Virement";
  createdAt: Date;
  transactionIds?: string[];
}

export interface PendingTransaction {
  id: string;
  amount: number;
  customerName: string;
  createdAt: Date;
}

export class CashModel {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async getBalance(): Promise<Balance> {
    try {
      if (!this.userId) throw new Error("User ID non défini");

      const soldeRef = doc(firebasestore, "soldes", this.userId);
      const soldeDoc = await getDoc(soldeRef);

      if (soldeDoc.exists()) {
        const data = soldeDoc.data();
        return {
          disponible: data?.soldeDisponible || 0,
          enAttente: data?.soldeEnAttente || 0,
          currency: data?.currency || "dt"
        };
      }

      // Create balance document if it doesn't exist
      await setDoc(soldeRef, {
        userId: this.userId,
        soldeDisponible: 0,
        soldeEnAttente: 0,
        currency: "dt",
        lastUpdated: serverTimestamp()
      });

      return { disponible: 0, enAttente: 0, currency: "dt" };
    } catch (error) {
      console.error("[CashModel] Error getting balance:", error);
      throw new Error("Erreur lors de la récupération du solde");
    }
  }

  async getTransactions(limitCount: number = 20): Promise<Transaction[]> {
    try {
      const q = query(
        collection(firebasestore, "transactions"),
        where("userId", "==", this.userId),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          amount: data.amount || 0,
          type: data.type || "transaction",
          status: data.status || "Non traité",
          description: data.description || "",
          createdAt: data.createdAt?.toDate() || new Date()
        };
      });
    } catch (error) {
      console.error("[CashModel] Error getting transactions:", error);
      throw new Error("Erreur lors de la récupération des transactions");
    }
  }

  async getWithdrawalRequests(): Promise<WithdrawalRequest[]> {
    try {
      const q = query(
        collection(firebasestore, "withdrawalRequests"),
        where("userId", "==", this.userId),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          amount: data.amount || 0,
          status: data.status || "pending",
          paymentMethod: data.paymentMethod || "Virement",
          createdAt: data.createdAt?.toDate() || new Date(),
          transactionIds: data.transactionIds || []
        };
      });
    } catch (error) {
      console.error("[CashModel] Error getting withdrawal requests:", error);
      throw new Error("Erreur lors de la récupération des demandes de retrait");
    }
  }

  async hasPendingWithdrawal(): Promise<boolean> {
    try {
      const q = query(
        collection(firebasestore, "withdrawalRequests"),
        where("userId", "==", this.userId),
        where("status", "==", "pending"),
        limit(1)
      );

      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error("[CashModel] Error checking pending withdrawals:", error);
      return false;
    }
  }
async requestWithdrawal(amount: number, paymentMethod: "Espèces" | "Virement", transactionIds?: string[]): Promise<string> {
  try {
    console.log("[DEBUG] 1/4 - Starting withdrawal with:", {
      userId: this.userId,
      amount,
      paymentMethod
    });

    // Vérification Firestore
    const testRef = doc(firebasestore, "test", "test");
    await setDoc(testRef, { test: true });
    console.log("[DEBUG] 2/4 - Firestore connection OK");
    await deleteDoc(testRef);

    const withdrawalData = {
      userId: this.userId,
      amount,
      status: "pending",
      paymentMethod,
      transactionIds: transactionIds || [],
      createdAt: serverTimestamp(),
      _debug: new Date().toISOString()
    };

    console.log("[DEBUG] 3/4 - Data to be saved:", withdrawalData);
    
    const docRef = await addDoc(collection(firebasestore, "withdrawalRequests"), withdrawalData);
    console.log("[SUCCESS] 4/4 - Withdrawal created with ID:", docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error("[FATAL ERROR] In requestWithdrawal:", {
      code: error.code, // Important pour Firestore
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}
  async getPendingTransactions(): Promise<PendingTransaction[]> {
    try {
      const q = query(
        collection(firebasestore, "transactions"),
        where("userId", "==", this.userId),
        where("status", "==", "Non traité"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          amount: data.amount || 0,
          customerName: data.customerName || "",
          createdAt: data.createdAt?.toDate() || new Date()
        };
      });
    } catch (error) {
      console.error("[CashModel] Error getting pending transactions:", error);
      throw error;
    }
  }

  async markTransactionsAsPending(transactionIds: string[]): Promise<void> {
    try {
      const batch = writeBatch(firebasestore);

      transactionIds.forEach(id => {
        const ref = doc(firebasestore, "transactions", id);
        batch.update(ref, { 
          status: "En attente",
          withdrawalRequestedAt: serverTimestamp()
        });
      });

      await batch.commit();
    } catch (error) {
      console.error("[CashModel] Error marking transactions as pending:", error);
      throw error;
    }
  }

  async transferPendingToAvailable(): Promise<void> {
    try {
      const soldeRef = doc(firebasestore, "soldes", this.userId);
      const soldeDoc = await getDoc(soldeRef);

      if (!soldeDoc.exists()) throw new Error("Aucun solde trouvé");

      const data = soldeDoc.data();
      const soldeEnAttente = data?.soldeEnAttente || 0;

      if (soldeEnAttente <= 0) throw new Error("Aucun solde en attente");

      await updateDoc(soldeRef, {
        soldeDisponible: increment(soldeEnAttente),
        soldeEnAttente: 0,
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error("[CashModel] Error transferring balance:", error);
      throw error;
    }
  }
}