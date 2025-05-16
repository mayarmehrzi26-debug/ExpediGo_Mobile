import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { collection, doc, getDocs, query, Timestamp, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { firebasestore } from '../../FirebaseConfig';
import Statusbagde from './Statusbagde2';

interface Order {
  id: string;
  origin?: string;
  destination?: string;
  date?: string;
  status?: string;
  totalAmount?: number; // Ajouter totalAmount
}

const CommandeCard: React.FC = () => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statuses, setStatuses] = useState<{ id: string; name: string }[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false); // Modal pour le mode de paiement
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null); // Mode de paiement sélectionné

  const fetchOrders = async () => {
    try {
      // Filtrer les commandes avec un statut différent de "Non traité"
      const q = query(
        collection(firebasestore, "livraisons"),
        where("status", "!=", "Non traité") // Exclure les commandes avec le statut "Non traité"
      );
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
          productId: data.productId, // Ajouter productId
          totalAmount: data.totalAmount || 0, // Récupérer totalAmount
        };
      }));

      setOrders(deliveriesList);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
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

  const updateSolde = async (amount: number) => {
    try {
      const soldeRef = doc(firebasestore, "solde", "total");
      const soldeDoc = await getDoc(soldeRef);

      if (soldeDoc.exists()) {
        const currentSolde = soldeDoc.data().amount || 0;
        await updateDoc(soldeRef, { amount: currentSolde + amount });
      } else {
        await setDoc(soldeRef, { amount });
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du solde :", error);
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
    if (selectedOrder) {
      try {
        const orderRef = doc(firebasestore, "livraisons", selectedOrder.id);

        if (newStatus === "Livré") {
          // Afficher la modal pour sélectionner le mode de paiement
          setPaymentModalVisible(true);
        } else {
          // Mettre à jour uniquement le statut
          await updateDoc(orderRef, { status: newStatus });

          // Mettre à jour l'état local
          setOrders((prevOrders) =>
            prevOrders.map((order) =>
              order.id === selectedOrder.id ? { ...order, status: newStatus } : order
            )
          );

          setModalVisible(false);
        }
      } catch (error) {
        console.error("Erreur lors de la mise à jour du statut :", error);
      }
    }
  };

  const handlePaymentMethodSelection = async (method: string) => {
    if (selectedOrder) {
      try {
        const orderRef = doc(firebasestore, "livraisons", selectedOrder.id);

        // Utiliser totalAmount directement depuis la commande
        const amount = selectedOrder.totalAmount || 0;

        // Mettre à jour le statut et le mode de paiement
        await updateDoc(orderRef, {
          status: "Livré",
          paymentMethod: method,
        });

        // Mettre à jour le solde
        await updateSolde(amount);

        // Mettre à jour l'état local
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === selectedOrder.id
              ? { ...order, status: "Livré", paymentMethod: method }
              : order
          )
        );

        setPaymentModalVisible(false);
        setModalVisible(false);
      } catch (error) {
        console.error("Erreur lors de la mise à jour du statut et du solde :", error);
      }
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchStatuses();
  }, []);

  return (
   
      {orders.length > 0 ? (
        orders.map((order) => (
          <View key={order.id} style={styles.card}>
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
              <TouchableOpacity key={status.id} onPress={() => updateOrderStatus(status.name)}>
                <Text style={styles.statusOption}>{status.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.button} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}

      {/* Modal for payment method selection */}
      {selectedOrder && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={paymentModalVisible}
          onRequestClose={() => setPaymentModalVisible(false)}
        >
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Choisissez le mode de paiement</Text>
            <TouchableOpacity onPress={() => handlePaymentMethodSelection("Espèces")}>
              <Text style={styles.statusOption}>Espèces</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handlePaymentMethodSelection("Virement")}>
              <Text style={styles.statusOption}>Virement</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => setPaymentModalVisible(false)}>
              <Text style={styles.buttonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </Modal>
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
  totalAmountText: {
    color: "#27251F",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 5,
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
  status: {
marginTop:15,
  },
  counterText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#44076a",
    marginBottom: 10,
    textAlign: "center",
  },
  
});

export default CommandeCard;