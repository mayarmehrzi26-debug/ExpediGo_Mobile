import { Ionicons } from "@expo/vector-icons";
import { addDoc, collection, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { firebasestore } from "../../FirebaseConfig"; // Import your Firebase config
import Header from "../../src/components/Header";

const BadClients: React.FC = ({ searchQuery, setSearchQuery }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [remark, setRemark] = useState("");
  const [clients, setClients] = useState([]);
  const [badClients, setBadClients] = useState([]);

  // Fetch clients from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firebasestore, "clients"), (snapshot) => {
      const clientList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClients(clientList);
    });

    return () => unsubscribe(); // Clean up the listener on unmount
  }, []);

  // Fetch bad clients from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firebasestore, "badClients"), (snapshot) => {
      const badClientList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBadClients(badClientList);
    });

    return () => unsubscribe(); // Clean up the listener on unmount
  }, []);

  const handleReportClient = async () => {
    if (!selectedClient || !remark) {
      Alert.alert("Erreur", "Veuillez choisir un client et ajouter une remarque.");
      return;
    }

    try {
      // Save reported client to Firestore
      await addDoc(collection(firebasestore, "badClients"), {
        clientId: selectedClient.id,
        clientName: selectedClient.name,
        remark: remark,
        reportedAt: new Date(),
      });

      Alert.alert("Succès", "Client signalé avec succès.");
    } catch (error) {
      console.error("Erreur lors de l'ajout du client signalé:", error);
      Alert.alert("Erreur", "Une erreur s'est produite lors de la sauvegarde du client signalé.");
    } finally {
      setModalVisible(false);
      setRemark("");
      setSelectedClient(null);
    }
  };

  const renderBadClient = ({ item }) => (
    <View style={styles.badClientItem}>
      <Text style={styles.badClientName}>Nom du client: {item.clientName}</Text>
      <Text style={styles.badClientRemark}>Remarque: {item.remark}</Text>
      <Text style={styles.reportedAt}>
        Signalé le: {new Date(item.reportedAt.seconds * 1000).toLocaleString()}
      </Text>
    </View>
  );

  const renderClientCard = ({ item }) => (
    <TouchableOpacity onPress={() => setSelectedClient(item)} style={styles.clientCard}>
      <Text style={styles.clientName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="Mauvais Clients" showBackButton={true} />
      
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.inputContainer}>
          <Ionicons name="search" size={20} color="#FF6B6B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Report Client Button */}
      <TouchableOpacity style={styles.submitButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.submitButtonText}>Signaler un client</Text>
      </TouchableOpacity>

      {/* FlatList for Bad Clients */}
      <FlatList
        data={badClients}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderBadClient}
        contentContainerStyle={styles.badClientsList}
      />

      {/* Modal for Reporting a Client */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Signaler un client</Text>
            <FlatList
              data={clients}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderClientCard} // Use the client card render function
            />
            {selectedClient && (
              <Text style={styles.selectedClientText}>Client sélectionné: {selectedClient.name}</Text>
            )}
            <TextInput
              style={styles.input}
              placeholder="Ajoutez une remarque"
              placeholderTextColor="#A7A9B7"
              value={remark}
              onChangeText={setRemark}
            />
            <TouchableOpacity style={styles.submitButton} onPress={handleReportClient}>
              <Text style={styles.submitButtonText}>Soumettre</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeModal}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  searchContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 5,
    backgroundColor: "#fff",
    height: 40,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
  },
  submitButton: {
    width: 224,
    height: 40,
    borderRadius: 5.4,
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 20,
  },
  submitButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  clientCard: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: "#E2E2E5",
    elevation: 2, // For shadow on Android
    shadowColor: "#000", // For shadow on iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  clientName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  selectedClientText: {
    marginVertical: 10,
    fontWeight: "bold",
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 5,
    paddingHorizontal: 10,
    width: "100%",
    marginTop: 10,
  },
  closeModal: {
    marginTop: 20,
    color: "blue",
  },
  badClientsList: {
    marginTop: 20,
  },
  badClientItem: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  badClientName: {
    fontWeight: "bold",
    fontSize: 16,
  },
  badClientRemark: {
    marginTop: 5,
    fontSize: 14,
    color: "#666",
  },
  reportedAt: {
    marginTop: 5,
    fontSize: 12,
    color: "#999",
  },
});

export default BadClients;