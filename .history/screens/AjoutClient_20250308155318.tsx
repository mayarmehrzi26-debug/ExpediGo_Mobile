import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
} from "react-native";

const BadClients: React.FC = ({ searchQuery, setSearchQuery }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [remark, setRemark] = useState("");
  const [clients, setClients] = useState([]); // Replace with your client data

  const handleReportClient = () => {
    if (!selectedClient || !remark) {
      Alert.alert("Erreur", "Veuillez choisir un client et ajouter une remarque.");
      return;
    }

    // Logic to save reported client
    console.log("Client signalé:", { client: selectedClient, remark });
    setModalVisible(false);
    setRemark(""); // Reset remark input
  };

  return (
    <View style={styles.container}>
      <Ionicons name="filter" size={19} color="#FF6B6B" />
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher"
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView contentContainerStyle={styles.menuContainer}>
        <TouchableOpacity style={styles.submitButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.submitButtonText}>Signaler un client</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal for reporting a client */}
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
              data={clients} // Replace with your client data
              keyExtractor={(item) => item.id.toString()} // Assuming each client has an unique id
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => setSelectedClient(item)}>
                  <Text style={styles.clientItem}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
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
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  menuContainer: {
    paddingHorizontal: 20,
  },
  submitButton: {
    width: 224,
    height: 40,
    borderRadius: 5,
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
  clientItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#E0E0E0",
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
});

export default BadClients;