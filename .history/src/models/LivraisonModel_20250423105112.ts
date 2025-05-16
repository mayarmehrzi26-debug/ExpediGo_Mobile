export interface Livraison {
  id: string;
  client: string;
  product: string;
  address: string;
  status: string;
  createdAt: Date;
  totalAmount: number;
  qrCodeUrl: string;
}

// Fonction utilitaire pour transformer les données Firestore en objet Livraison
export const fromFirestoreData = (
  deliveryDoc: any,
  clientSnap: any,
  productSnap: any,
  addressSnap: any
): Livraison => {
  const data = deliveryDoc.data();

  return {
    id: deliveryDoc.id,
    client: clientSnap?.data()?.name || 'Client inconnu',
    product: productSnap?.data()?.name || 'Produit inconnu',
    address: addressSnap?.data()?.address || 'Adresse inconnue',
    status: data?.status || 'Non spécifié',
    createdAt: data?.createdAt?.toDate() || new Date(),
    totalAmount: data?.totalAmount || 0,
    qrCodeUrl: data?.qrCodeUrl || '',
  };
};