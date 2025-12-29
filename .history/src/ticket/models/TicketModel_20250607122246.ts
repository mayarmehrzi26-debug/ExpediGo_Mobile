import { addDoc, collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where } from "firebase/firestore";
import { firebaseAuth ,firebasestore } from "../../../FirebaseConfig";

export interface Ticket {
  id: number;
  type: string;
  bordereau: string;
  titre: string | null;
  description: string | null;
  service: string | null;
  status: string | null;
  createdAt: Date;
  userId: string;
}

export interface Option {
  label: string;
  value: string;
}
export const TicketStatusOptions = [
  { label: "Non traité", value: "Non traité" },
  { label: "En cours", value: "En cours" },
  { label: "Résolu", value: "Résolu" }
];

export class TicketModel {
  static async fetchOrderIds(): Promise<Option[]> {
    try {
      const querySnapshot = await getDocs(collection(firebasestore, "livraisons"));
      return querySnapshot.docs.map((doc) => ({
        label: doc.id,
        value: doc.id,
      }));
    } catch (error) {
      console.error("Error fetching order IDs:", error);
      throw error;
    }
  }

  static async generateNumericId(): Promise<number> {
    const counterRef = doc(firebasestore, "counters", "ticketCounter");
    const counterDoc = await getDoc(counterRef);

    if (counterDoc.exists()) {
      const lastId = counterDoc.data().lastId;
      const newId = lastId + 1;
      await updateDoc(counterRef, { lastId: newId });
      return newId;
    } else {
      await setDoc(counterRef, { lastId: 1 });
      return 1;
    }
  }

  static async addTicket(ticketData: Omit<Ticket, 'id'>): Promise<void> {
    const user = firebaseAuth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    const numericId = await this.generateNumericId();
    const ticketWithId = { 
      ...ticketData, 
      id: numericId,
      userId: user.uid // Add the user ID to the ticket
    };
    await addDoc(collection(firebasestore, "tickets"), ticketWithId);
  }

  static async fetchTickets(): Promise<Ticket[]> {
    try {
      const user = firebaseAuth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Create a query that filters tickets by the current user's ID
      const q = query(
        collection(firebasestore, "tickets"),
        where("userId", "==", user.uid)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.data().id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
      } as Ticket));
    } catch (error) {
      console.error("Error fetching tickets:", error);
      throw error;
    }
  }

  // Add a method to fetch all tickets (for admin users)
  static async fetchAllTickets(): Promise<Ticket[]> {
    try {
      const querySnapshot = await getDocs(collection(firebasestore, "tickets"));
      return querySnapshot.docs.map((doc) => ({
        id: doc.data().id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
      } as Ticket));
    } catch (error) {
      console.error("Error fetching all tickets:", error);
      throw error;
    }
  }
  static async checkAdminStatus(userId: string): Promise<boolean> {
  try {
    const userDoc = await getDoc(doc(firebasestore, "users", userId));
    return userDoc.exists();
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}
}