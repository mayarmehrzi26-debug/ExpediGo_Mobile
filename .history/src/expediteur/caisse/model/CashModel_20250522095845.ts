// CashModel.ts
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
  where
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
}

export class CashModel {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async getBalance(): Promise<Balance> {
    try {
      const soldeRef = doc(firebasestore, "soldes", this.userId);
      const soldeDoc = await getDoc(soldeRef);

      if (soldeDoc.exists()) {
        const data = soldeDoc.data();
        return {
          disponible: data.soldeDisponible || 0,
          enAttente: data.soldeEnAttente || 0,
          currency: "dt"
        };
      }
      
      // Si le document n'existe pas, on le crée avec des valeurs à 0
      await setDoc(soldeRef, {
        userId: this.userId,
        soldeDisponible: 0,
        soldeEnAttente: 0,
        lastUpdated: serverTimestamp()
      });
      
      return { disponible: 0, enAttente: 0, currency: "dt" };
    } catch (error) {
      console.error("Error getting balance:", error);
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
          status: data.status || "completed",
          description: data.description || "",
          createdAt: data.createdAt?.toDate?.() || new Date()
        };
      });
    } catch (error) {
      console.error("Error getting transactions:", error);
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
          createdAt: data.createdAt?.toDate?.() || new Date()
        };
      });
    } catch (error) {
      console.error("Error getting withdrawal requests:", error);
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
      console.error("Error checking pending withdrawals:", error);
      return false;
    }
  }

  async requestWithdrawal(amount: number, paymentMethod: "Espèces" | "Virement"): Promise<string> {
    try {
      const balance = await this.getBalance();
      
      // Vérifier que le montant est valide
      if (amount <= 0) {
        throw new Error("Le montant doit être supérieur à 0");
      }
      
      // Vérifier le solde en attente
      if (amount > balance.enAttente) {
        throw new Error("Solde en attente insuffisant pour cette demande");
      }
      
      // Vérifier s'il y a déjà une demande en attente
      const hasPending = await this.hasPendingWithdrawal();
      if (hasPending) {
        throw new Error("Vous avez déjà une demande en attente");
      }
      
      // Créer la demande de versement
      const docRef = await addDoc(collection(firebasestore, "withdrawalRequests"), {
        userId: this.userId,
        amount,
        status: "pending",
        paymentMethod,
        createdAt: serverTimestamp()
      });
      
      // Mettre à jour le solde (retirer le montant en attente)
      const soldeRef = doc(firebasestore, "soldes", this.userId);
      await updateDoc(soldeRef, {
        soldeEnAttente: increment(-amount),
        lastUpdated: serverTimestamp()
      });
      
      return docRef.id;
    } catch (error) {
      console.error("Error requesting withdrawal:", error);
      throw error;
    }
  }

  async transferPendingToAvailable(): Promise<void> {
    try {
      const soldeRef = doc(firebasestore, "soldes", this.userId);
      const soldeDoc = await getDoc(soldeRef);
      
      if (!soldeDoc.exists()) {
        throw new Error("Aucun solde trouvé pour cet utilisateur");
      }
      
      const data = soldeDoc.data();
      const soldeEnAttente = data.soldeEnAttente || 0;
      
      if (soldeEnAttente <= 0) {
        throw new Error("Aucun solde en attente à transférer");
      }
      
      await updateDoc(soldeRef, {
        soldeDisponible: increment(soldeEnAttente),
        soldeEnAttente: 0,
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error("Error transferring balance:", error);
      throw error;
    }
  }
}