import { Ionicons } from "@expo/vector-icons";
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
import { AjoutClientPresenter } from "../presenters/AjoutClientPresenter";

interface AjoutClientProps {
  navigation: any;
}

const AjoutClientView: React.FC<AjoutClientProps> = ({ navigation }) => {
  const [clientName, setClientName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const presenter = new AjoutClientPresenter({
    setLoading: (isLoading) => setLoading(isLoading),
    showError: (title, message) => Alert.alert(title, message),
    showSuccess: (title, message, callback) => 
      Alert.alert(title, message, [{ text: "OK", onPress: callback }]),
    navigateBack: () => navigation.goBack(),
  });

  const handleSubmit = () => {
    presenter.handleSubmit({
      name: clientName,
      phone: phoneNumber,
      email,
      address
    });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      {/* Header et formulaire inchangés */}
      {/* ... (le reste du code JSX reste identique) ... */}
    </KeyboardAvoidingView>
  );
};

// Styles inchangés
const styles = StyleSheet.create({
  // ... (les styles restent identiques) ...
});

export default AjoutClientView;