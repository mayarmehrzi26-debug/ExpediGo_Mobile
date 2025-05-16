import { addDoc, collection, doc, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { firebasestore } from "../../../FirebaseConfig";

export interface Ticket {
  id: number;
  type: string;
  bordereau: string;
  titre: string | null;
  description: string | null;
  service: string | null;
  createdAt: Date;
}

export interface Option {
  label: string;
  value: string;
}

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
    const numericId = await this.generateNumericId();
    const ticketWithId = { ...ticketData, id: numericId };
    await addDoc(collection(firebasestore, "tickets"), ticketWithId);
  }
}