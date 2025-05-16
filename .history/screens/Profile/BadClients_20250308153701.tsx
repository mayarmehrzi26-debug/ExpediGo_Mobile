import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Header from "../../src/components/Header";

const BadClients: React.FC = () => {
  const navigation = useNavigation();

  const [activeScreen, setActiveScreen] = useState("Profile");
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
    

      <ScrollView contentContainerStyle={styles.menuContainer}>
       

     

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
  profileContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#fff",
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  menuContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: "#1B2128",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    height: 40,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  submitButton: {
    width: 224,
    height: 40,
    borderRadius: 5.4,
    backgroundColor: "#F47F57",
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

export default BadClients;