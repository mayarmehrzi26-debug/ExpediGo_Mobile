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
        <View style={styles.formGroup}>
          <Text style={styles.label}>Prénom</Text>
          <TextInput
            style={styles.input}
            placeholder="Mayar"
            placeholderTextColor="#A7A9B7"
            value={clientName}
            onChangeText={setClientName}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nom</Text>
          <TextInput
            style={styles.input}
            placeholder="Mehrzi"
            placeholderTextColor="#A7A9B7"
            value={clientLastName}
            onChangeText={setClientLastName}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="mayarmehrzi22@gmail.com"
            placeholderTextColor="#A7A9B7"
            value={clientEmail}
            onChangeText={setClientEmail}
            keyboardType="email-address"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Téléphone</Text>
          <TextInput
            style={styles.input}
            placeholder="+215 46595556"
            placeholderTextColor="#A7A9B7"
            value={clientTel}
            onChangeText={setClientTel}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Mot de passe</Text>
          <TextInput
            style={styles.input}
            placeholder="********"
            placeholderTextColor="#A7A9B7"
            value={clientMdp}
            onChangeText={setClientMdp}
            secureTextEntry={true}
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSave}>
          <Text style={styles.submitButtonText}>Sauvegarder</Text>
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
    backgroundColor: "#54E598",
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