import { doc, getDoc } from 'firebase/firestore';
import { firebasestore } from '../../FirebaseConfig';

export interface CommandeDetails {
  id: string;
  origin: string;
  destination: string;
  clientName: string;
  clientPhone: string;
  status: string;
  payment: string;
  isFragile: boolean;
  createdAt: Date;
  totalAmount: number;
  livreur: string;
  notes: string;
}

export class CommandeDetailsModel {
  async getCommandeDetails(commandeId: string): Promise<CommandeDetails | null> {
    try {
      const commandeDoc = await getDoc(doc(firebasestore, 'livraisons', commandeId));
      
      if (!commandeDoc.exists()) {
        return null;
      }

      const commandeData = commandeDoc.data();
      
      // Get livreur details if available
      let livreurName = 'Non assigné';
      if (commandeData.livreurId) {
        const livreurDoc = await getDoc(doc(firebasestore, 'livreurs', commandeData.livreurId));
        if (livreurDoc.exists()) {
          livreurName = livreurDoc.data().name || livreurName;
        }
      }

      return {
        id: commandeId,
        origin: commandeData.origin || 'Adresse inconnue',
        destination: commandeData.destination || 'Adresse inconnue',
        clientName: commandeData.clientName || 'Client inconnu',
        clientPhone: commandeData.clientPhone || '',
        status: commandeData.status || 'En attente',
        payment: commandeData.payment || 'Non spécifié',
        isFragile: commandeData.isFragile || false,
        createdAt: commandeData.createdAt?.toDate() || new Date(),
        totalAmount: commandeData.totalAmount || 0,
        livreur: livreurName,
        notes: commandeData.notes || '',
      };
    } catch (err) {
      console.error('Error fetching command details:', err);
      return null;
    }
  }
}