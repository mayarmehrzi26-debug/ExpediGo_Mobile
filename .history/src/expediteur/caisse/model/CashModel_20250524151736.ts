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
  writeBatch
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
  clientId?: string;
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
  rejectionReason?: string;

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
    return snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      const createdAt = data.createdAt?.toDate?.() || new Date();
      
      return {
        id: docSnap.id,
        userId: data.userId,
        amount: data.amount || 0,
        type: data.type || "transaction",
        status: data.status || "Non traité",
        description: data.description || "",
        createdAt,
        clientName: data.clientName || data.customerName || "Client inconnu",
        clientId: data.clientId,
        packageCount: data.packageCount || 0,
        paymentMethod: data.paymentMethod || "Virement",
        date: createdAt.toLocaleDateString(),
        time: createdAt.toLocaleTimeString()
      };
    });
  } catch (error) {
    console.error("[CashModel] Error getting transactions:", error);
    throw error;
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
      console.log('Firestore data:', { 
        id: doc.id, 
        rejectionReason: data.rejectionReason 
      }); // Log de débogage
      
      return {
        id: doc.id,
        userId: data.userId,
        amount: data.amount || 0,
        status: data.status || "pending",
        paymentMethod: data.paymentMethod || "Virement",
        createdAt: data.createdAt?.toDate() || new Date(),
        transactionIds: data.transactionIds || [],
        rejectionReason: data.rejectionReason || undefined // Utilisez undefined au lieu de ""
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
    return false; // En cas d'erreur, considérez qu'il n'y a pas de demande en attente
  }
}
async requestWithdrawal(
  transactionIds: string[], 
  paymentMethod: "Espèces" | "Virement"
): Promise<string> {
  try {
    if (!transactionIds || transactionIds.length === 0) {
      throw new Error("Aucune transaction sélectionnée");
    }

    // Calculer le montant total des transactions sélectionnées
    const transactions = await Promise.all(
      transactionIds.map(id => 
        getDoc(doc(firebasestore, "transactions", id))
      )
    );

    const totalAmount = transactions.reduce((sum, docSnap) => {
      if (docSnap.exists()) {
        return sum + (docSnap.data().amount || 0);
      }
      return sum;
    }, 0);

    if (totalAmount <= 0) {
      throw new Error("Le montant total doit être positif");
    }

    const withdrawalData = {
      userId: this.userId,
      amount: totalAmount,
      status: "pending",
      paymentMethod,
      transactionIds,
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(
      collection(firebasestore, "withdrawalRequests"), 
      withdrawalData
    );

    // Marquer les transactions comme "En attente de versement"
    const batch = writeBatch(firebasestore);
    transactionIds.forEach(id => {
      const ref = doc(firebasestore, "transactions", id);
      batch.update(ref, { 
        status: "En attente",
        withdrawalRequestId: docRef.id
      });
    });
    await batch.commit();

    return docRef.id;
  } catch (error) {
    console.error("[CashModel] Error requesting withdrawal:", error);
    throw error;
  }
}
async getUntreatedTransactions(): Promise<Transaction[]> {
  try {
    const q = query(
      collection(firebasestore, "transactions"),
      where("userId", "==", this.userId),
      where("status", "==", "Non traité"),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        userId: data.userId,
        amount: data.amount || 0,
        type: data.type || "transaction",
        status: data.status || "Non traité",
        description: data.description || "",
        createdAt: data.createdAt?.toDate?.() || new Date(),
        clientName: data.clientName || data.customerName || "Client inconnu",
        clientId: data.clientId
      };
    });
  } catch (error) {
    console.error("[CashModel] Error getting untreated transactions:", error);
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

    // Limiter à 500 opérations par batch (limite Firestore)
    const maxBatchSize = 500;
    for (let i = 0; i < transactionIds.length; i += maxBatchSize) {
      const batchChunk = transactionIds.slice(i, i + maxBatchSize);
      
      batchChunk.forEach(id => {
        const ref = doc(firebasestore, "transactions", id);
        batch.update(ref, { 
          status: "En attente",
          withdrawalRequestedAt: serverTimestamp()
        });
      });

      await batch.commit();
      console.log(`Batch ${i/maxBatchSize + 1} committed`);
    }
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