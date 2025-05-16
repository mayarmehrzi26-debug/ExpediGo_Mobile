import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { collection, getDocs, query, Timestamp, where } from 'firebase/firestore';
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { firebasestore } from '../../FirebaseConfig';
import Statusbagde from './Statusbagde2';

interface Order {
  id: string;
  origin?: string;
  destination?: string;
  date?: string;
  status?: string;
  totalAmount?: number;
}

interface CommandeCardProps {
  navigation: any; // Prop navigation pour la redirection
}

const CommandeCard: React.FC<CommandeCardProps> = ({ navigation }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statuses, setStatuses] = useState<{ id: string; name: string }[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const q = query(collection(firebasestore, "livraisons"), where("status", "!=", "Non traité"));
      const querySnapshot = await getDocs(q);

      const deliveriesList = await Promise.all(querySnapshot.docs.map(async (doc) => {
        const data = doc.data();
        const clientSnapshot = await getDocs(collection(firebasestore, "clients"));
        const clientData = clientSnapshot.docs.find(clientDoc => clientDoc.id === data.client)?.data();
        const addressSnapshot = await getDocs(collection(firebasestore, "adresses"));
        const addressData = addressSnapshot.docs.find(addressDoc => addressDoc.id === data.address)?.data();

        let formattedDate = "Date inconnue";
        if (data.createdAt instanceof Timestamp) {
          const dateObj = data.createdAt.toDate();
          formattedDate = `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else if (data.date) {
          formattedDate = data.date;
        }

        return {
          id: doc.id,
          origin: clientData?.address || "origine inconnu",
          destination: addressData?.address || "destination inconnue",
          date: formattedDate,
          status: data.status || "Statut inconnu",
          totalAmount: data.totalAmount || 0,
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

  return (
    <View>
      {orders.length > 0 ? (
        orders.map((order) => (
          <TouchableOpacity
            key={order.id}
            onPress={() => navigation.navigate('PackageDetailsLiv', { scannedData: order.id })}
          >
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Image source={require('../../assets/image.png')} style={styles.icon} />
                <View style={styles.cardDetails}>
                  <Text style={styles.orderNumber}>Commande #{order.id}</Text>
                  <Text style={styles.orderText}>De: {order.origin}</Text>
                  <Text style={styles.orderText}>Vers: {order.destination}</Text>
                  <View style={styles.dateContainer}>
                    <MaterialIcons name="date-range" size={16} color="black" />
                    <Text style={styles.orderText}>{order.date}</Text>
                  </View>
                  <Text style={styles.orderText}>Montant total: {order.totalAmount} DT</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="black" />
              </View>
              <View style={styles.status}>
                <TouchableOpacity onPress={() => {
                  setSelectedOrder(order);
                  setModalVisible(true);
                }}>
                  <Statusbagde status={order.status} />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <Text style={styles.noOrders}>Aucune livraison effectuée</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F1EEFF",
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderRadius: 12,
    elevation: 5,
    marginTop: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    width: 80,
    height: 100,
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
  noOrders: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#777",
  },
  status: {
    marginTop: 15,
  },
});

export default CommandeCard;