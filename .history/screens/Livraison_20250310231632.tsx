import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { collection, getDocs,doc, query, Timestamp, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { firebasestore } from '../FirebaseConfig';
import StatusBadge from '../src/components/StatusBadge';

interface Delivery {
  id: string;
  client?: string;
  address?: string;
  date?: string;
  status?: string;
}

const Livraison: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [statuses, setStatuses] = useState<{ id: string; name: string }[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchDeliveries = async () => {
    try {
      const q = query(collection(firebasestore, "livraisons"));
      const querySnapshot = await getDocs(q);

      const deliveriesList = await Promise.all(querySnapshot.docs.map(async (doc) => {
        const data = doc.data();

        const formattedDate = data.createdAt instanceof Timestamp
          ? data.createdAt.toDate().toLocaleString()
          : data.date || "Date inconnue";

        return {
          id: doc.id,
          client: data.client || "Client inconnu",
          address: data.address || "Adresse inconnue",
          date: formattedDate,
          status: data.status || "Statut inconnu",
        };
      }));

      setDeliveries(deliveriesList);
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

  const updateDeliveryStatus = async (newStatus: string) => {
    if (selectedDelivery) {
      try {
        const deliveryRef = doc(firebasestore, "livraisons", selectedDelivery.id);
        await updateDoc(deliveryRef, { status: newStatus });

        setDeliveries((prevDeliveries) =>
          prevDeliveries.map((delivery) =>
            delivery.id === selectedDelivery.id ? { ...delivery, status: newStatus } : delivery
          )
        );

        setModalVisible(false);
      } catch (error) {
        console.error("Error updating delivery status:", error);
      }
    }
  };

  useEffect(() => {
    fetchDeliveries();
    fetchStatuses();
  }, []);

  return (
    <View>
      {deliveries.length > 0 ? (
        deliveries.map((delivery) => (
          <View key={delivery.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Image source={require('../../assets/package.png')} style={styles.icon} />
              <View style={styles.cardDetails}>
                <Text style={styles.orderNumber}>Livraison #{delivery.id}</Text>
                <Text style={styles.orderText}>Client: {delivery.client}</Text>
                <Text style={styles.orderText}>Adresse: {delivery.address}</Text>
                <View style={styles.dateContainer}>
                  <MaterialIcons name="date-range" size={16} color="black" />
                  <Text style={styles.orderText}>{delivery.date}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="black" />
            </View>
            <TouchableOpacity onPress={() => {
              setSelectedDelivery(delivery);
              setModalVisible(true);
            }}>
              <StatusBadge status={delivery.status} />
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <Text style={styles.noDeliveries}>Aucune livraison disponible</Text>
      )}

      {/* Modal for status selection */}
      {selectedDelivery && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Choisissez un nouveau statut</Text>
            {statuses.map((status) => (
              <TouchableOpacity key={status.id} onPress={() => updateDeliveryStatus(status.name)}>
                <Text style={styles.statusOption}>{status.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.button} onPress={() => setModalVisible(false)}>
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
  noDeliveries: {
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
});

export default Livraison;