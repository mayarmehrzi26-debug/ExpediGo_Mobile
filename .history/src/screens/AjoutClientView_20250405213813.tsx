import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity, View
} from "react-native";
import { useDispatch } from "react-redux";
import { handleClientSubmit } from "../presenters/AjoutClientPresenter";

const AjoutClientView = ({ navigation }: any) => {
  const [clientName, setClientName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const onSubmit = () => {
    handleClientSubmit(
      {
        name: clientName,
        phone: phoneNumber,
        email,
        address,
      },
      dispatch,
      navigation,
      setLoading
    );
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
          {/* Champs formulaire */}
          <Input label="Nom complet" value={clientName} onChangeText={setClientName} />
          <Input label="Numéro de téléphone" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" />
          <Input label="E-mail personnel" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <Input label="Adresse" value={address} onChangeText={setAddress} multiline />

          <TouchableOpacity style={styles.submitButton} onPress={onSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.submitButtonText}>Ajouter le client</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const Input = ({ label, ...props }: any) => (
  <View style={{ marginBottom: 24 }}>
    <Text style={styles.label}>{label}</Text>
    <TextInput style={styles.input} placeholderTextColor="#A7A9B7" {...props} />
  </View>
);

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
export default AjoutClientView;
