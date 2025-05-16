import { Ionicons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { collection, doc, getDocs, query, Timestamp, updateDoc } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { firebasestore } from "../../FirebaseConfig";

interface Order {
  id: string;
  origin?: string;
  destination?: string;
  date?: string;
  status?: string;
}

const OrderCard: React.FC = () => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, [fadeAnim]);

  const fetchOrders = async () => {
    try {
      const q = query(collection(firebasestore, "livraisons"));
      const querySnapshot = await getDocs(q);

      const deliveriesList = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        let formattedDate = "Date inconnue";

        if (data.createdAt instanceof Timestamp) {
          const dateObj = data.createdAt.toDate();
          formattedDate = `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
        } else if (data.date) {
          formattedDate = data.date;
        }

        return {
          id: doc.id,
          origin: data.origin || "Origine inconnue",
          destination: data.destination || "Destination inconnue",
          date: formattedDate,
          status: data.status || "En attente",
        };
      });

      setOrders(deliveriesList);
    } catch (error) {
      console.error("Erreur lors de la récupération des livraisons :", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const confirmDelivery = async () => {
    if (selectedOrder) {
      try {
        const orderRef = doc(firebasestore, "livraisons", selectedOrder.id);
        await updateDoc(orderRef, { status: "À livrer" });

        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === selectedOrder.id ? { ...order, status: "À livrer" } : order
          )
        );

        setModalVisible(false);
      } catch (error) {
        console.error("Erreur lors de la mise à jour de la commande :", error);
      }
    }
  };

  return (
    <View>
      {orders.length > 0 ? (
        orders.map((order) => (
          <View key={order.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Image source={require("../../assets/package.png")} style={styles.icon} />
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

            <Animated.View style={{ opacity: fadeAnim }}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  setSelectedOrder(order);
                  setModalVisible(true);
                }}
              >
                <Text style={styles.buttonText}>Je livre</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        ))
      ) : (
        <Text style={styles.noOrders}>Aucune livraison effectuée</Text>
      )}

      {/* Modal de confirmation */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Voulez-vous livrer ce colis ?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>Non</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonConfirm]} onPress={confirmDelivery}>
                <Text style={styles.modalButtonText}>Oui</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  button: {
    backgroundColor: "#44076a",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: 15,
    alignSelf: "flex-end",
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: 300,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 5,
    marginHorizontal: 5,
    backgroundColor: "#ddd",
  },
  modalButtonConfirm: {
    backgroundColor: "#44076a",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default OrderCard;
