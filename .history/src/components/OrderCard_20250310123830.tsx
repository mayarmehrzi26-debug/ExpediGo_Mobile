import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { collection, getDocs, query, Timestamp } from 'firebase/firestore'; // Importation correcte
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { firebasestore } from '../../FirebaseConfig'; // Importation Firestore

interface Order {
  id: string;
  address?: string;
  client?: {
    address?: string;
  };
  createdAt?: {
    seconds: number;
    nanoseconds: number;
  }; // Si createdAt est un Timestamp Firestore
}

const extractNumericId = (id: string, length: number = 3): number => {
  const numericString = id.replace(/\D/g, "");
  const truncatedString = numericString.slice(0, length);
  return truncatedString ? parseInt(truncatedString, 10) : 0;
};

const OrderCard: React.FC = () => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [orders, setOrders] = useState<Order[]>([]); // Stocker les commandes

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, [fadeAnim]);

  // Fonction pour récupérer les livraisons effectuées
  const fetchOrders = async () => {
    try {
      const q = query(collection(firebasestore, "livraisons"));
      const querySnapshot = await getDocs(q);

      const deliveriesList = await Promise.all(querySnapshot.docs.map(async (doc) => {
        const data = doc.data();

        const clientSnapshot = await getDocs(collection(firebasestore, "clients"));
        const clientData = clientSnapshot.docs.find(clientDoc => clientDoc.id === data.client)?.data();

        const addressSnapshot = await getDocs(collection(firebasestore, "adresses"));
        const addressData = addressSnapshot.docs.find(addressDoc => addressDoc.id === data.address)?.data();

        const date = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toLocaleDateString() : data.date || "Date inconnue";

        const numericId = extractNumericId(doc.id);

        return {
          id: numericId,
          origin: clientData?.address || "origine inconnu",
          destination: addressData?.address || "destination inconnue",
          date,
          status: data.status || "En attente", // Ajouter un champ "status"
        };
      }));

      setOrders(deliveriesList);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Fonction pour formater la date
  const formatDate = (timestamp: { seconds: number; nanoseconds: number } | undefined) => {
    if (!timestamp || !timestamp.seconds) return "Date inconnue";
    const date = new Date(timestamp.seconds * 1000); // Convertir en millisecondes
    return date.toLocaleDateString(); // Formater la date
  };

  return (
    <View>
      {orders.length > 0 ? (
        orders.map((order) => (
          <View key={order.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Image source={require('../../assets/package.png')} style={styles.icon} />
              <View style={styles.cardDetails}>
                <Text style={styles.orderNumber}>Commande #{order.id}</Text>
                <Text style={styles.orderText}>De: {order.origin}</Text>
                <Text style={styles.orderText}>Vers: {order.destination}</Text>
                <View style={styles.dateContainer}>
                  <MaterialIcons name="date-range" size={16} color="black" />
                  <Text style={styles.orderText}>{formatDate(order.date)}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="black" />
            </View>

            <Animated.View style={{ opacity: fadeAnim }}>
              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Je livre</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        ))
      ) : (
        <Text style={styles.noOrders}>Aucune livraison effectuée</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderRadius: 12,
    elevation: 5,
    marginTop: 16,
    marginHorizontal: 22,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    width: 60,
    height: 60,
    marginRight: 10,
  },
  cardDetails: {
    flex: 1,
  },
  orderNumber: {
    fontWeight: "bold",
    fontSize: 16,
  },
  orderText: {
    color: "#555",
    fontSize: 14,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  button: {
    backgroundColor: "#44076a",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: 15,
    alignSelf: 'flex-end',
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  noOrders: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#777",
  },
});

export default OrderCard;