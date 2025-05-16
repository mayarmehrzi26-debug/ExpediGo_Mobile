import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { firebasestore } from '../FirebaseConfig';

interface PackageDetailsProps {
  route: {
    params: {
      trackingCode: string;
    };
  };
}

const PackageDetails: React.FC<PackageDetailsProps> = ({ route }) => {
  const { trackingCode } = route.params;
  const [delivery, setDelivery] = useState<any>(null);

  useEffect(() => {
    const fetchDelivery = async () => {
      try {
        const deliveryQuery = await getDocs(collection(firebasestore, "livraisons"), where("trackingCode", "==", trackingCode));
        if (!deliveryQuery.empty) {
          const deliveryDoc = deliveryQuery.docs[0];
          setDelivery(deliveryDoc.data());
        } else {
          console.warn("Aucune livraison trouvée avec ce code.");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de la livraison :", error);
      }
    };

    fetchDelivery();
  }, [trackingCode]);

  if (!delivery) {
    return (
      <View style={styles.container}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Détails de la livraison</Text>
      <Text>Code de suivi : {delivery.trackingCode}</Text>
      <Text>Client : {delivery.client}</Text>
      <Text>Produit : {delivery.product}</Text>
      <Text>Statut : {delivery.status}</Text>
      <Text>Adresse : {delivery.address}</Text>
      <Text>Paiement : {delivery.payment}</Text>
      <Text>Colis fragile : {delivery.isFragile ? "Oui" : "Non"}</Text>
      <Text>Échange : {delivery.isExchange ? "Oui" : "Non"}</Text>
      <Text>Date de création : {delivery.createdAt.toDate().toLocaleString()}</Text>
      {delivery.qrCodeUrl && (
        <Image source={{ uri: delivery.qrCodeUrl }} style={styles.qrCode} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F7F7F7",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  qrCode: {
    width: 200,
    height: 200,
    marginTop: 20,
  },
});

export default PackageDetails;