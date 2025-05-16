import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Header from "../../src/components/Header";

const BusinessInfo: React.FC = () => {
  const navigation = useNavigation();

  const [businessName, setBusinessName] = useState<string>("");
  const [businessReason, setBusinessReason] = useState<string>("");
  const [businessRegistration, setBusinessRegistration] = useState<string>("");
  const [businessTaxId, setBusinessTaxId] = useState<string>("");
  const [accountHolder, setAccountHolder] = useState<string>("");
  const [rib, setRib] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [businessTel, setBusinessTel] = useState<string>("");
  const [website, setWebsite] = useState<string>("");
  const [address, setAddress] = useState<string>("");

  const handleSave = () => {
    console.log("Données sauvegardées :", {
      businessName,
      businessReason,
      businessRegistration,
      businessTaxId,
      accountHolder,
      rib,
      contactEmail,
      businessTel,
      website,
      address,
    });
  };

  return (
    <View
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100} // Ajustez cette valeur selon vos besoins
    >
      <Header title="Informations de Business" showBackButton={true} />
      <View style={styles.profileContainer}>
        <Image
          source={{ uri: "https://avatar.iran.liara.run/public/77" }} // Remplacez par une image appropriée
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>Mayar Mehrzi</Text>
      </View>

      <ScrollView contentContainerStyle={styles.menuContainer}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Nom commercial</Text>
          <TextInput
            style={styles.input}
            placeholder="Veuillez entrer le nom commercial"
            placeholderTextColor="#A7A9B7"
            value={businessName}
            onChangeText={setBusinessName}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Raison sociale</Text>
          <TextInput
            style={styles.input}
            placeholder="Entrez la raison sociale"
            placeholderTextColor="#A7A9B7"
            value={businessReason}
            onChangeText={setBusinessReason}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Registre du commerce</Text>
          <TextInput
            style={styles.input}
            placeholder="Entrez le numéro de registre du commerce"
            placeholderTextColor="#A7A9B7"
            value={businessRegistration}
            onChangeText={setBusinessRegistration}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Matricule fiscal</Text>
          <TextInput
            style={styles.input}
            placeholder="Entrez le matricule fiscal"
            placeholderTextColor="#A7A9B7"
            value={businessTaxId}
            onChangeText={setBusinessTaxId}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Titulaire du compte</Text>
          <TextInput
            style={styles.input}
            placeholder="Entrez le titulaire du compte"
            placeholderTextColor="#A7A9B7"
            value={accountHolder}
            onChangeText={setAccountHolder}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>RIB</Text>
          <TextInput
            style={styles.input}
            placeholder="Entrez le RIB"
            placeholderTextColor="#A7A9B7"
            value={rib}
            onChangeText={setRib}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email de contact</Text>
          <TextInput
            style={styles.input}
            placeholder="Entrez l'email de contact"
            placeholderTextColor="#A7A9B7"
            value={contactEmail}
            onChangeText={setContactEmail}
            keyboardType="email-address"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Téléphone</Text>
          <TextInput
            style={styles.input}
            placeholder="Entrez le numéro de téléphone"
            placeholderTextColor="#A7A9B7"
            value={businessTel}
            onChangeText={setBusinessTel}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Site Web</Text>
          <TextInput
            style={styles.input}
            placeholder="Entrez l'adresse du site web"
            placeholderTextColor="#A7A9B7"
            value={website}
            onChangeText={setWebsite}
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
    paddingBottom: 50, // Ajout d'un padding en bas
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

export default BusinessInfo;