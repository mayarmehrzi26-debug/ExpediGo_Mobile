import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import Header from "../../src/components/Header";

const BadClients: React.FC = ({ searchQuery, setSearchQuery }) => {
  const navigation = useNavigation();

  const [clientName, setClientName] = useState<string>("");
  const [clientLastName, setClientLastName] = useState<string>("");
  const [clientEmail, setClientEmail] = useState<string>("");
  const [clientTel, setClientTel] = useState<string>("");
  const [clientMdp, setClientMdp] = useState<string>("");

  const handleSave = () => {
    // Logique pour sauvegarder les données
    console.log("Données sauvegardées :", {
      clientName,
      clientLastName,
      clientEmail,
      clientTel,
      clientMdp,
    });
    // Vous pouvez ajouter ici une logique pour envoyer les données à un serveur ou les stocker localement
  };

  return (
    <View style={styles.container}>
      <Header title="Mauvais Clients" showBackButton={true} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
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

        {/* Add more content here if needed */}

        <TouchableOpacity style={styles.submitButton} onPress={handleSave}>
          <Text style={styles.submitButtonText}>Signaler un client</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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
    height: '100%', // Ensure it takes full height
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
});