import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { firebasestore } from '../../FirebaseConfig';
import { Delivery } from '../deliveryTypes';

export class DeliveryModel {
  
  async fetchAllDeliveries(): Promise<Delivery[]> {
    try {
      // Correction : Utilisation correcte de doc() avec firebasestore
      const deliveriesRef = collection(firebasestore, 'livraisons');
      const snapshot = await getDocs(deliveriesRef);
      
      const deliveries = await Promise.all(
        snapshot.docs.map(async (deliveryDoc) => {
          const data = deliveryDoc.data();
          
          // Correction : Utilisation correcte de doc() pour les références
          const productRef = doc(firebasestore, 'products', data.product);
          const clientRef = doc(firebasestore, 'clients', data.client);
          const addressRef = doc(firebasestore, 'adresses', data.address);

          const [productSnap, clientSnap, addressSnap] = await Promise.all([
            getDoc(productRef),
            getDoc(clientRef),
            getDoc(addressRef)
          ]);

          return {
            id: deliveryDoc.id,
            client: clientSnap.data()?.name | 'Client inconnu',
            product: productSnap.data()?.name || 'Produit inconnu',
            address: addressSnap.data()?.address || 'Adresse inconnue',
            status: data.status || 'Non spécifié',
            createdAt: data.createdAt?.toDate() || new Date(),
            totalAmount: data.totalAmount || 0,
            qrCodeUrl: data.qrCodeUrl || ''
          };
        })
      );
      
      return deliveries;
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      throw error; // Important pour le débogage
    }
  }
}