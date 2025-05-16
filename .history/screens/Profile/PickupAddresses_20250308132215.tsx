import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Header from "../../src/components/Header";

const PickupAddresses: React.FC = () => {
  const navigation = useNavigation();
  
  const addresses = [
    { id: 1, zone: "Bab Bhar, Sousse", address: "92 Rue de Sidi Bou Zid 2042" },
    { id: 2, zone: "Bab Bhar, Sousse", address: "92 Rue de Sidi Bou Zid 2042" },
    { id: 3, zone: "Bab Bhar, Sousse", address: "92 Rue de Sidi Bou Zid 2042" },
    { id: 4, zone: "Bab Bhar, Sousse", address: "92 Rue de Sidi Bou Zid 2042" },
  ];

  return (
    <View style={styles.container}>
      <Header title="Adresses de pickup" showBackButton={true} />

      <ScrollView contentContainerStyle={styles.menuContainer}>
        {addresses.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.cardTitle}>Adresse PickUp {item.id}</Text>
            <View style={styles.cardRow}>
              <Text style={styles.label}>Zone</Text>
              <Text style={styles.value}>{item.zone}</Text>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.label}>Adresse</Text>
              <Text style={styles.value}>{item.address}</Text>
            </View>
            <View style={styles.buttonsContainer}>
              <TouchableOpacity style={styles.editButton}>
                <Text style={styles.buttonText}>Modifier</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton}>
                <Text style={styles.buttonText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bouton flottant pour ajouter une adresse */}
      <TouchableOpacity style={styles.floatingButton}>
        <Ionicons name="add" size={40} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  menuContainer: {
    paddingHorizontal: 20,
    paddingBottom: 80, // Pour éviter que le bouton flottant cache le contenu
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
  },
  value: {
    fontSize: 14,
    color: "#333",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  editButton: {
    backgroundColor: "#54E598",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: "#54E598",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});

export default PickupAddresses;
