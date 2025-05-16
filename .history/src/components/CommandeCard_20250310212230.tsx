import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { collection, doc, getDoc, getDocs, query, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { firebasestore } from '../../FirebaseConfig';
import StatusBadge from './StatusBadge';

interface Order {
  id: string;
  origin?: string;
  destination?: string;
  date?: string;
  status?: string;
}



const CommandeCard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statuses, setStatuses] = useState<{ id: string; name: string }[]>([]);



  const fetchOrders = async () => {
    try {
      const q = query(collection(firebasestore, "livraisons"));
      const querySnapshot = await getDocs(q);

      const ordersList = await Promise.all(querySnapshot.docs.map(async (doc) => {
        const data = doc.data();
        const id = doc.id;

        return {
          id: id.toString(),
          origin: data.origin || "origine inconnue",
          destination: data.destination || "destination inconnue",
          date: data.date || "Date inconnue",
          status: data.status || "Statut inconnu",
        };
      }));

      setOrders(ordersList);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchStatuses = async () => {
    try {
      const statusSnapshot = await getDocs(collection(firebasestore, "Status"));
      const statusList = statusSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().nomStat,
      }));
      setStatuses(statusList);
    } catch (error) {
      console.error("Error fetching statuses:", error);
    }
  };
  const updateOrderStatus = async (newStatus: string) => {
    if (selectedOrder) {
      try {
        const orderRef = doc(firebasestore, "livraisons", selectedOrder.id);
        const orderDoc = await getDoc(orderRef); // Vérifiez si le document existe
        if (!orderDoc.exists()) {
          console.error("Document does not exist:", selectedOrder.id);
          return;
        }
        await updateDoc(orderRef, { status: newStatus });
        setModalVisible(false);
        fetchOrders(); // Re-fetch orders to update the view
      } catch (error) {
        console.error("Error updating order status:", error);
      }
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchStatuses();
  }, []);

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
                  <Text style={styles.orderText}>{order.date}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="black" />
            </View>
            <View style={styles.badgeContainer}>
              <Pressable onPress={() => {
                setSelectedOrder(order);
                setModalVisible(true);
              }}>
                <StatusBadge status={order.status} />
              </Pressable>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.noOrders}>Aucune livraison effectuée</Text>
      )}

      {/* Modal for status selection */}
      {selectedOrder && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Choisissez un nouveau statut</Text>
            {statuses.map((status) => (
              <Pressable key={status.id} onPress={() => updateOrderStatus(status.id)}>
                <Text style={styles.statusOption}>{status.name}</Text>
              </Pressable>
            ))}
            <Pressable style={styles.button} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Annuler</Text>
            </Pressable>
          </View>
        </Modal>
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
    fontSize: 18,
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
  badgeContainer: {
    alignItems: "flex-end",
    marginTop: 5,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  statusOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    width: "100%",
    textAlign: "center",
  },
  button: {
    backgroundColor: "red",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: 15,
    alignSelf: 'center',
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default CommandeCard;