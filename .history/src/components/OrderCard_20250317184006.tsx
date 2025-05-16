import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, Timestamp } from 'firebase/firestore';
import { getFunctions, httpsCallable } from "firebase/functions";
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { firebasestore } from '../../FirebaseConfig'; // Importation Firestore

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
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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

      const deliveriesList = await Promise.all(querySnapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        console.log("Commande récupérée :", data);

        const clientRef = doc(firebasestore, "clients", data.client);
        const clientSnapshot = await getDoc(clientRef);
        const clientData = clientSnapshot.exists() ? clientSnapshot.data() : null;

        if (!clientData) {
          console.warn(`⚠️ Client introuvable pour la commande ${docSnap.id}`);
        }

        const addressRef = doc(firebasestore, "adresses", data.address);
        const addressSnapshot = await getDoc(addressRef);
        const addressData = addressSnapshot.exists() ? addressSnapshot.data() : null;

        if (!addressData) {
          console.warn(`⚠️ Adresse introuvable pour la commande ${docSnap.id}`);
        }

        let formattedDate = "Date inconnue";
        if (data.createdAt instanceof Timestamp) {
          const dateObj = data.createdAt.toDate();
          formattedDate = `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else if (data.date) {
          formattedDate = data.date;
        }

        return {
          id: docSnap.id,
          origin: clientData?.address || "Origine inconnue",
          destination: addressData?.address || "Destination inconnue",
          date: formattedDate,
          status: data.status || "En attente",
        };
      }));

      setOrders(deliveriesList);
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des livraisons :", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleConfirmDelivery = async () => {
    if (selectedOrder) {
      try {
        console.log("🔎 Vérification de la commande ID :", selectedOrder.id);

        const orderRef = doc(firebasestore, "livraisons", selectedOrder.id);
        const orderSnapshot = await getDoc(orderRef);

        if (!orderSnapshot.exists()) {
          console.error("❌ Erreur : La commande n'existe pas dans Firestore !");
          return;
        }

        const orderData = orderSnapshot.data();
        console.log("✅ Commande trouvée :", orderData);

        const clientRef = doc(firebasestore, "clients", orderData.client);
        const clientSnapshot = await getDoc(clientRef);

        if (!clientSnapshot.exists()) {
          console.error("❌ Erreur : Client introuvable !");
          return;
        }

        const clientEmail = clientSnapshot.data()?.email;
        console.log("📩 Email du client :", clientEmail);

        if (!clientEmail) {
          console.error("❌ Erreur : L'email du client est introuvable !");
          return;
        }

        // Déplacer la commande vers "Orders"
        const newOrderRef = doc(firebasestore, "Orders", selectedOrder.id);
        await setDoc(newOrderRef, {
          ...orderData,
          status: "En attente",
          deliveredAt: Timestamp.now(),
        });

        // Supprimer la commande de "livraisons"
        await deleteDoc(orderRef);

        // Envoyer un email via Firebase Cloud Functions
        const functions = getFunctions();
        const sendEmail = httpsCallable(functions, "sendDeliveryEmail");
        await sendEmail({ email: clientEmail, orderId: selectedOrder.id });

        console.log("📩 Email envoyé avec succès !");

        // Mettre à jour l'état local
        setOrders(prevOrders => prevOrders.filter(order => order.id !== selectedOrder.id));
        setModalVisible(false);
      } catch (error) {
        console.error("❌ Erreur lors de la confirmation de la livraison :", error);
      }
    }
  };

  return (
    <View>
      {/* Affichage des commandes */}
      {orders.length > 0 ? (
        orders.map((order) => (
          <View key={order.id} style={styles.card}>
            <Text style={styles.orderNumber}>Commande #{order.id}</Text>
            <Text style={styles.orderText}>De: {order.origin}</Text>
            <Text style={styles.orderText}>Vers: {order.destination}</Text>
            <Text style={styles.orderText}>{order.date}</Text>

            <TouchableOpacity onPress={() => {
              setSelectedOrder(order);
              setModalVisible(true);
            }}>
              <Text style={styles.buttonText}>Je livre</Text>
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <Text>Aucune livraison effectuée</Text>
      )}

      {/* Modal de confirmation */}
      <Modal visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View>
          <Text>Êtes-vous sûr de livrer cette commande ?</Text>
          <TouchableOpacity onPress={handleConfirmDelivery}>
            <Text>Oui</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setModalVisible(false)}>
            <Text>Non</Text>
          </TouchableOpacity>
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
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 10,
    width: 300,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  modalButton: {
    backgroundColor: "#44076a",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default OrderCard;
