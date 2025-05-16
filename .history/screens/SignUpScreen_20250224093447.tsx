import { FontAwesome } from "@expo/vector-icons"; // Pour les icônes
import { useNavigation } from "@react-navigation/native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { firebaseAuth } from "../../FirebaseConfig";

const SignUpScreen: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [surname, setSurname] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const navigation = useNavigation();

  const signUp = async () => {
    if (!email || !password || !name || !surname || !phone) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      await createUserWithEmailAndPassword(firebaseAuth, email, password);
      Alert.alert("Succès", "Compte créé avec succès !");
      navigation.navigate("OTPScreen", { phone }); // Redirection vers l'écran OTP
    } catch (error: any) {
      Alert.alert("Erreur", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Création de Compte</Text>
      <Text style={styles.title1}>Bienvenue cher Expéditeur dans la meilleure société de livraison</Text>

      <TextInput style={styles.input} placeholder="Nom" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Prénom" value={surname} onChangeText={setSurname} />
      <TextInput style={styles.input} placeholder="Téléphone" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Mot de passe" secureTextEntry value={password} onChangeText={setPassword} />
      <TextInput style={styles.input} placeholder="Confirmer le mot de passe" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />

      <TouchableOpacity style={styles.button} onPress={signUp}>
        <Text style={styles.buttonText}>Créer un compte</Text>
      </TouchableOpacity>

      <View style={styles.orContainer}>
        <View style={styles.line} />
        <Text style={styles.orText}>Ou Inscrivez-vous avec</Text>
        <View style={styles.line} />
      </View>

      <View style={styles.socialContainer}>
        <TouchableOpacity style={styles.socialButton}>
          <FontAwesome name="facebook" size={24} color="#1877F2" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <FontAwesome name="google" size={24} color="#DB4437" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <FontAwesome name="instagram" size={24} color="#C13584" />
        </TouchableOpacity>
      </View>

      <Text style={styles.footerText}>
        Vous avez déjà un compte ? <Text style={styles.linkText} onPress={() => navigation.navigate("Login")}>Se connecter</Text>
      </Text>
    </View>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#fff" ,paddingTop:50},
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  title1: { fontSize: 13, marginBottom: 20, color: "#A7A9B7" },
  input: { 
    height: 50, 
    borderWidth: 1, 
    borderColor: "#E0E0E0",  
    borderRadius: 8, 
    paddingHorizontal: 20, 
    marginVertical: 5, 
    backgroundColor: "#F2F4F7",
    color: "#A0A0A0",
    marginRight:10,
   marginLeft:10,
  },
  button: { backgroundColor: "green", padding: 15, borderRadius: 8, alignItems: "center", marginTop: 10 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  // Ligne de séparation "Ou Inscrivez-vous avec"
  orContainer: { flexDirection: "row", alignItems: "center", marginVertical: 20 },
  line: { flex: 1, height: 1, backgroundColor: "#E0E0E0" },
  orText: { marginHorizontal: 10, color: "#A7A9B7", fontSize: 14 },

  // Boutons sociaux
  socialContainer: { flexDirection: "row", justifyContent: "center", marginBottom: 20 },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#F2F4F7",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },

  // Lien de connexion
  footerText: { textAlign: "center", fontSize: 14, color: "#A0A0A0", marginTop: 10 },
  linkText: { color: "#FF5722", fontWeight: "bold" },
});
