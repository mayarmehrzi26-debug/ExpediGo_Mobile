import { Ionicons } from "@expo/vector-icons";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { firebasestore } from "../FirebaseConfig";

interface AjoutClientProps {
  navigation: any;

}

const AjoutClient: React.FC<AjoutClientProps> = ({ navigation }) => {
  const [clientName, setClientName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [zone, setZone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!clientName || !phoneNumber || !email || !zone || !address) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(firebasestore, "clients"), {
        name: clientName,
        phoneNumber,
        email,
        zone,
        address,
        createdAt: serverTimestamp(),
      });

      Alert.alert("Succès", "Client ajouté avec succès", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Erreur lors de l'ajout du client:", error);
      Alert.alert(
        "Erreur",
        "Une erreur s'est produite lors de l'ajout du client",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajouter un client</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Formulaire */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nom complet</Text>
            <TextInput
              style={styles.input}
              placeholder="Entrez le nom et le prénom"
              placeholderTextColor="#A7A9B7"
              value={clientName}
              onChangeText={setClientName}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Numéro de téléphone</Text>
            <TextInput
              style={styles.input}
              placeholder="Entrez le numéro de téléphone"
              placeholderTextColor="#A7A9B7"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>E-mail personnel</Text>
            <TextInput
              style={styles.input}
              placeholder="Entrez l'adresse email"
              placeholderTextColor="#A7A9B7"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Zone</Text>
            <TextInput
              style={styles.input}
              placeholder="Entrez la zone"
              placeholderTextColor="#A7A9B7"
              value={zone}
              onChangeText={setZone}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Adresse</Text>
            <TextInput
              style={styles.input}
              placeholder="Entrez l'adresse"
              placeholderTextColor="#A7A9B7"
              value={address}
              onChangeText={setAddress}
            />
          </View>

          {/* Bouton de soumission */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Créer un client</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 51,
    paddingBottom: 14,
  },
  backButton: {
    width: 46,
    height: 47,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#27251F",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    color: "#27251F",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 15,
  },
  input: {
    height: 42,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#A7A9B7",
    fontSize: 11,
    color: "#27251F",
  },
  submitButton: {
    width: 224,
    height: 37,
    borderRadius: 5.4,
    backgroundColor: "#54E598",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 40,
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "800",
  },
});

export default AjoutClient;