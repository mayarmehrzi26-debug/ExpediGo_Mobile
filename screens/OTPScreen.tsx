import { useNavigation, useRoute } from "@react-navigation/native";
import {
  createUserWithEmailAndPassword,
  PhoneAuthProvider,
  signInWithCredential
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { firebaseAuth, firebasestore } from "../FirebaseConfig";

const OTPScreen: React.FC = () => {
  const [otp, setOtp] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  
  const navigation = useNavigation();
  const route = useRoute();
  const {
    verificationId,
    email,
    name,
    phone,
    password
  } = route.params as {
    verificationId: string;
    email: string;
    name: string;
    phone: string;
    password: string;
  };

  const verifyOtp = async (): Promise<void> => {
    if (otp.length !== 6) {
      Alert.alert("Erreur", "Le code OTP doit contenir 6 chiffres");
      return;
    }

    setLoading(true);
    
    try {
      // Vérification du code OTP
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      await signInWithCredential(firebaseAuth, credential);

      // Création du compte avec email/mot de passe
      const userCredential = await createUserWithEmailAndPassword(
        firebaseAuth,
        email,
        password
      );

      const user = userCredential.user;

      // Enregistrement des informations supplémentaires
      await setDoc(doc(firebasestore, "users", user.uid), {
        uid: user.uid,
        name,
        email,
        phone,
        role: "client",
        createdAt: new Date(),
        verified: true
      });

      Alert.alert("Succès", "Compte créé avec succès !");
      navigation.navigate("HomeScreen");
    } catch (error: any) {
      console.error("Erreur OTP:", error);
      let errorMessage = "Code OTP invalide ou expiré";
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = "Code OTP incorrect";
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Cet email est déjà utilisé";
      }
      Alert.alert("Erreur", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async (): Promise<void> => {
    setLoading(true);
    try {
      const confirmation = await signInWithPhoneNumber(
        firebaseAuth,
        phone
      );
      Alert.alert("Succès", "Nouveau code OTP envoyé");
    } catch (error: any) {
      Alert.alert("Erreur", "Impossible d'envoyer un nouveau code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground 
      source={require('../assets/1.png')} 
      style={styles.backgroundImage}
      blurRadius={2}
    >
      <View style={styles.overlay}>
        <View style={styles.logoContainer}>
          <Text style={styles.appName}>Vérification OTP</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.subtitle}>Entrez le code OTP envoyé au {phone}</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Code OTP (6 chiffres)"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              value={otp}
              onChangeText={setOtp}
              maxLength={6}
            />
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && styles.disabledButton]} 
            onPress={verifyOtp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Vérifier et créer compte</Text>
            )}
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Vous n'avez pas reçu de code ? </Text>
            <TouchableOpacity onPress={resendOtp}>
              <Text style={styles.resendLink}>Renvoyer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
    backgroundColor: '#3D0666'
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  card: {
    backgroundColor: '#877DAB',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 25,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 245, 245, 0.7)',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginVertical: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  input: {
    flex: 1,
    height: 50,
    color: '#333',
    textAlign: 'center',
    fontSize: 18,
  },
  button: {
    backgroundColor: '#3D0666',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#3D0666',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  resendText: {
    color: '#fff',
    fontSize: 14,
  },
  resendLink: {
    color: '#AD3C96',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default OTPScreen;