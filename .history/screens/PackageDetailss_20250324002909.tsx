import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../NavigationTypes'; // Ajustez le chemin selon votre structure
import { doc, getDoc } from 'firebase/firestore';
import { firebasestore } from '../../FirebaseConfig'; // Importation Firestore

type PackageDetailsRouteProp = RouteProp<RootStackParamList, 'PackageDetails'>;

interface PackageDetailsProps {
  route: PackageDetailsRouteProp;
}

const PackageDetailss: React.FC<PackageDetailsProps> = ({ route }) => {
  const { orderId } = route.params; // Récupérer l'ID de la commande
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const orderRef = doc(firebasestore, 'livraisons', orderId);
        const orderDoc = await getDoc(orderRef);

        if (orderDoc.exists()) {
          setOrder(orderDoc.data());
        } else {
          console.log('Commande non trouvée');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des détails de la commande :', error);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (!order) {
    return (
      <View style={styles.container}>
        <Text>Chargement des détails de la commande...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Détails de la commande</Text>
      <Text style={styles.detail}>ID de la commande : {orderId}</Text>
      <Text style={styles.detail}>Origine : {order.origin}</Text>
      <Text style={styles.detail}>Destination : {order.destination}</Text>
      <Text style={styles.detail}>Statut : {order.status}</Text>
      <Text style={styles.detail}>Date : {order.date}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F7F7F7',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#44076a',
  },
  detail: {
    fontSize: 16,
    marginBottom: 10,
    color: '#27251F',
  },
});

export default PackageDetailss;