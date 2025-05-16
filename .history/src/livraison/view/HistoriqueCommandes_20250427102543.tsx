import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firebasestore } from '../../../FirebaseConfig';
import Header from '../../../src/components/Header';
import NavBottom from '../../src/components/shared/NavBottom';
import DeliveryHistoryCard from '../components/DeliveryHistoryCard';

const HistoriqueCommandes = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeScreen, setActiveScreen] = useState('Historique');
  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchUserDeliveries = async () => {
      try {
        if (!currentUser) return;
        
        setLoading(true);
        const deliveriesRef = collection(firebasestore, 'livraisons');
        const q = query(
          deliveriesRef,
          where('createdBy', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const userDeliveries = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setDeliveries(userDeliveries);
      } catch (error) {
        console.error('Erreur lors de la récupération des commandes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDeliveries();
  }, [currentUser]);

  const formatDate = (date) => {
    if (!date) return 'Date inconnue';
    const d = date.toDate();
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <View style={styles.container}>
      <Header title="Historique des commandes" showBackButton={true} />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#877DAB" />
        </View>
      ) : deliveries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucune commande trouvée</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {deliveries.map((delivery) => (
            <DeliveryHistoryCard
              key={delivery.id}
              id={delivery.id}
              client={delivery.client}
              address={delivery.address}
              status={delivery.status}
              date={formatDate(delivery.createdAt)}
              product={delivery.product}
              totalAmount={delivery.totalAmount}
            />
          ))}
        </ScrollView>
      )}
      
      <NavBottom activeScreen={activeScreen} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#A7A9B7',
  },
});

export default HistoriqueCommandes;