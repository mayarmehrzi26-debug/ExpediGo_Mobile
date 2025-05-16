import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { firebaseAuth } from "../FirebaseConfig";

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true); // Pour l'état de connexion

  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      if (user) {
        navigation.navigate("HomeScreen"); // Redirection si déjà connecté
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }

    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password);
      navigation.navigate("HomeScreen");
    } catch (error: any) {
      Alert.alert("Erreur", error.message);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="green" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Se connecter à votre compte</Text>
      <Text style={styles.title1}>Bienvenue cher Expéditeur dans la meilleure société  de livraison</Text>

      <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Mot de passe" secureTextEntry value={password} onChangeText={setPassword} />

      <TouchableOpacity style={styles.forgotPassword} onPress={() => navigation.navigate("ForgotPasswordScreen")}>
        <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={login}>
        <Text style={styles.buttonText}>Se connecter</Text>
      </TouchableOpacity>

      <View style={styles.orContainer}>
        <View style={styles.line} />
        <Text style={styles.orText}>Ou connectez-vous avec</Text>
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
        Vous n'avez pas de compte ? <Text style={styles.linkText} onPress={() => navigation.navigate("SignUp")}>Créer un compte</Text>
      </Text>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  title1: { fontSize: 14, marginBottom: 20, color: "#A7A9B7" },
  input: { height: 50, borderWidth: 1, borderColor: "#E0E0E0", borderRadius: 8, paddingHorizontal: 20, marginVertical: 5, backgroundColor: "#F2F4F7", color: "#A0A0A0" },
  forgotPassword: { alignSelf: "flex-end", marginRight: 15, marginBottom: 10 },
  forgotText: { color: "#FF5722", fontSize: 14, fontWeight: "bold" },
  button: { backgroundColor: "green", padding: 15, borderRadius: 8, alignItems: "center", marginTop: 10 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  orContainer: { flexDirection: "row", alignItems: "center", marginVertical: 20 },
  line: { flex: 1, height: 1, backgroundColor: "#E0E0E0" },
  orText: { marginHorizontal: 10, color: "#A7A9B7", fontSize: 14 },
  socialContainer: { flexDirection: "row", justifyContent: "center", marginBottom: 20 },
  socialButton: { width: 50, height: 50, borderRadius: 8, backgroundColor: "#F2F4F7", justifyContent: "center", alignItems: "center", marginHorizontal: 10 },
  footerText: { textAlign: "center", fontSize: 14, color: "#A0A0A0", marginTop: 10 },
  linkText: { color: "#FF5722", fontWeight: "bold" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
});
