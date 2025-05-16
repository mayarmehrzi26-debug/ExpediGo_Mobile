import { useNavigation } from "@react-navigation/native";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Platform,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const SignUpScreen: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [secureEntry, setSecureEntry] = useState<boolean>(true);
  const [secureConfirmEntry, setSecureConfirmEntry] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const recaptchaVerifier = useRef<RecaptchaVerifier | null>(null);
  const navigation = useNavigation();

  // Initialisation du reCAPTCHA
  useEffect(() => {
    const auth = getAuth();
    
    // Configuration différente selon la plateforme
    const recaptchaConfig = Platform.select({
      android: {
        size: 'invisible',
        defaultCountry: 'TN',
      },
      ios: {
        size: 'normal',
        defaultCountry: 'TN',
      },
      default: {
        size: 'invisible'
      }
    });

    try {
      recaptchaVerifier.current = new RecaptchaVerifier(
        'recaptcha-container', 
        recaptchaConfig,
        auth
      );
    } catch (error) {
      console.error('Erreur initialisation reCAPTCHA:', error);
      Alert.alert("Erreur", "Problème d'initialisation de la sécurité");
    }

    return () => {
      if (recaptchaVerifier.current) {
        recaptchaVerifier.current.clear();
      }
    };
  }, []);

  // Formatage du numéro tunisien
  const formatTunisianPhoneNumber = (text: string): string => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;

    if (cleaned.length > 2) {
      formatted = `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)}`;
      if (cleaned.length > 4) {
        formatted += ` ${cleaned.slice(4, 6)}`;
        if (cleaned.length > 6) {
          formatted += ` ${cleaned.slice(6, 8)}`;
        }
      }
    }

    return formatted;
  };

  const handlePhoneChange = (text: string): void => {
    const formatted = formatTunisianPhoneNumber(text);
    setPhone(formatted);
  };

  const validateTunisianPhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '');
    return /^[24579]\d{7}$/.test(cleaned);
  };

  const validateForm = (): boolean => {
    if (!email.trim() || !password.trim() || !name.trim() || !phone.trim()) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return false;
    }

    if (!validateTunisianPhone(phone)) {
      Alert.alert("Erreur", "Numéro tunisien invalide. Doit commencer par 2, 4, 5, 7 ou 9 et avoir 8 chiffres.");
      return false;
    }

    if (password.length < 6) {
      Alert.alert("Erreur", "Le mot de passe doit contenir au moins 6 caractères.");
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas.");
      return false;
    }

    return true;
  };

  const sendOtp = async (): Promise<void> => {
    if (!validateForm()) return;
    if (!recaptchaVerifier.current) {
      Alert.alert("Erreur", "Problème de vérification de sécurité. Veuillez réessayer.");
      return;
    }

    const cleanedPhone = phone.replace(/\D/g, '');
    setLoading(true);

    try {
      const phoneNumber = `+216${cleanedPhone}`;
      console.log("Numéro envoyé:", phoneNumber);

      const auth = getAuth();
      const confirmation = await signInWithPhoneNumber(
        auth, 
        phoneNumber, 
        recaptchaVerifier.current
      );
      
      navigation.navigate("OTPScreen", {
        verificationId: confirmation.verificationId,
        email,
        name,
        phone: phoneNumber,
        password
      });
    } catch (error: any) {
      console.error("Erreur OTP:", error);
      let errorMessage = "Erreur lors de l'envoi du SMS";
      
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = "Numéro de téléphone invalide.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Trop de demandes. Veuillez réessayer plus tard.";
      } else if (error.code === 'auth/missing-client-identifier') {
        errorMessage = "Problème de configuration Firebase. Vérifiez votre configuration.";
      }
      
      Alert.alert("Erreur", errorMessage);
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
          <Text style={styles.appName}>Créer un compte</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.subtitle}>Rejoignez la meilleure société de livraison</Text>

          {/* Vos champs de formulaire existants... */}

          {/* Container reCAPTCHA (invisible) */}
          <View 
            id="recaptcha-container" 
            style={{
              position: 'absolute',
              top: -10000,
              left: 0,
              width: 1,
              height: 1
            }}
          />

          <TouchableOpacity 
            style={[styles.button, loading && styles.disabledButton]} 
            onPress={sendOtp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Envoyer OTP</Text>
            )}
          </TouchableOpacity>

          {/* Reste de votre JSX... */}
        </View>
      </View>
    </ImageBackground>
  );
};

// Vos styles existants...