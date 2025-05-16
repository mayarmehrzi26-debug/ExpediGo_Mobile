import { Ionicons } from "@expo/vector-icons";
import { setDoc,addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
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
  View
} from "react-native";
import { firebasestore } from "../FirebaseConfig";

interface AjoutClientProps {
  navigation: any;
}

const AjoutClient: React.FC<AjoutClientProps> = ({ navigation }) => {
  const [clientName, setClientName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!clientName || !phoneNumber || !email || !address) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    try {
      setLoading(true);
      
      // Récupérer l'ID numérique
      const counterDocRef = doc(collection(firebasestore, "counters"), "clientCounter");
      const counterDoc = await getDoc(counterDocRef);
      let newId = 1; // Valeur par défaut

      if (counterDoc.exists()) {
        newId = counterDoc.data().count + 1; // Incrémentez le compteur
        await updateDoc(counterDocRef, { count: newId }); // Mettez à jour le compteur
      } else {
        await addDoc(collection(firebasestore, "counters"), { count: newId }); // Créez le document si nécessaire
      }

      // Ajouter le client avec un ID numérique
      await setDoc(doc(firebasestore, "clients", newId.toString()), {
        name: clientName,
        phone: phoneNumber,
        email,
        address,
        createdAt: serverTimestamp(),
      });

      Alert.alert("Succès", "Client ajouté avec succès", [{ text: "OK", onPress: () => navigation.goBack() }]);
    } catch (error) {
      console.error("Erreur lors de l'ajout du client:", error);
      Alert.alert("Erreur", "Une erreur s'est produite lors de l'ajout du client");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajouter un client</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
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
            <Text style={styles.label}>Adresse</Text>
            <TextInput
              style={[styles.input, styles.textArea]} // Ajout d'un style pour agrandir l'input
              placeholder="Entrez l'adresse"
              placeholderTextColor="#A7A9B7"
              value={address}
              onChangeText={setAddress}
              multiline={true} // Permet d'écrire sur plusieurs lignes
              numberOfLines={4} // Définit la hauteur initiale
            />
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.submitButtonText}>Ajouter le client</Text>}
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
    paddingTop: 61,
    paddingBottom: 24,
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
  textArea: {
    height: 100, // Ajuste la hauteur
    textAlignVertical: 'top', // Aligne le texte en haut comme une textarea
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
    marginBottom: 20,
  },
  input: {
    height: 52,
    paddingHorizontal: 11,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#A7A9B7",
    fontSize: 14,
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
    marginTop: 20,
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "800",
  },
});

export default AjoutClient;