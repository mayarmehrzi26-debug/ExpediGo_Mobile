import { useNavigation } from "@react-navigation/native";
import { sendPasswordResetEmail } from "firebase/auth";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { firebaseAuth } from "../../FirebaseConfig";

const ForgotPasswordScreen: React.FC = () => {
  const [email, setEmail] = useState<string>("");

  const navigation = useNavigation();

  const resetPassword = async () => {
    if (!email) {
      Alert.alert("Erreur", "Veuillez entrer votre email.");
      return;
    }

    try {
      await sendPasswordResetEmail(firebaseAuth, email);
      Alert.alert("Succès", "Un email de réinitialisation a été envoyé !");
      navigation.navigate("Login");
    } catch (error: any) {
      Alert.alert("Erreur", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mot de passe oublié?</Text>
      <Text style={styles.subtitle}>Ne vous inquiétez pas ! Cela arrive. Veuillez entrer l'email associé à votre compte. </Text>
      <Text style={styles.title1}>Email address</Text>

      <TextInput style={styles.input} placeholder="Entrez votre email" keyboardType="email-address" value={email} onChangeText={setEmail} />

      <TouchableOpacity style={styles.button} onPress={resetPassword}>
        <Text style={styles.buttonText}>Envoyer le code</Text>
      </TouchableOpacity>
       <Text style={styles.footerText}>
       Souvenez-vous du mot de passe ? <Text style={styles.linkText} onPress={() => navigation.navigate("Login")}>Connectez-vous</Text>
            </Text>
    </View>
  );
};


export default ForgotPasswordScreen;
const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#fff" },
    title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
    title1: { fontSize: 13, fontWeight: "bold", marginBottom: 10 ,marginTop:20},

    subtitle: { fontSize: 14, marginBottom: 20, color: "#A7A9B7" },
    input: { height: 50, borderWidth: 1, borderColor: "#E0E0E0", borderRadius: 8, paddingHorizontal: 20, marginVertical: 5, backgroundColor: "#F2F4F7", color: "#A0A0A0" },
    button: { backgroundColor: "green", padding: 15, borderRadius: 8, alignItems: "center", marginTop: 50 },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
    footerText: { textAlign: "center", fontSize: 14, color: "#A0A0A0", marginTop: 90 },
    linkText: { color: "black", fontWeight: "bold" },
  });
