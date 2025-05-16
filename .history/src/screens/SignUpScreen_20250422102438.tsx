import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
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

const SignUpScreen: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [secureEntry, setSecureEntry] = useState<boolean>(true);
  const [secureConfirmEntry, setSecureConfirmEntry] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const navigation = useNavigation();

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

    const cleanedPhone = phone.replace(/\D/g, '');
    setLoading(true);

    try {
      const phoneNumber = `+216${cleanedPhone}`;
      console.log("Numéro envoyé:", phoneNumber);

      const auth = getAuth();
      const recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
        'size': 'invisible',
      }, auth);

      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
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

          <View style={styles.inputContainer}>
            <FontAwesome name="user" size={20} color="#AD3C96" style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="Nom complet" 
              placeholderTextColor="#999"
              value={name} 
              onChangeText={setName} 
            />
          </View>

          <View style={styles.inputContainer}>
            <FontAwesome name="phone" size={20} color="#AD3C96" style={styles.inputIcon} />
            <Text style={styles.phonePrefix}>+216</Text>
            <TextInput 
              style={[styles.input, styles.phoneInput]} 
              placeholder="20 123 456" 
              placeholderTextColor="#999"
              keyboardType="phone-pad" 
              value={phone} 
              onChangeText={handlePhoneChange}
              maxLength={11}
            />
          </View>

          <View style={styles.inputContainer}>
            <FontAwesome name="envelope" size={20} color="#AD3C96" style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="Email" 
              placeholderTextColor="#999"
              keyboardType="email-address" 
              value={email} 
              onChangeText={setEmail} 
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <FontAwesome name="lock" size={20} color="#AD3C96" style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="Mot de passe (6 caractères min)" 
              placeholderTextColor="#999"
              secureTextEntry={secureEntry} 
              value={password} 
              onChangeText={setPassword} 
            />
            <TouchableOpacity onPress={() => setSecureEntry(!secureEntry)} style={styles.eyeIcon}>
              <FontAwesome name={secureEntry ? "eye-slash" : "eye"} size={20} color="#777" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <FontAwesome name="lock" size={20} color="#AD3C96" style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="Confirmer le mot de passe" 
              placeholderTextColor="#999"
              secureTextEntry={secureConfirmEntry} 
              value={confirmPassword} 
              onChangeText={setConfirmPassword} 
            />
            <TouchableOpacity onPress={() => setSecureConfirmEntry(!secureConfirmEntry)} style={styles.eyeIcon}>
              <FontAwesome name={secureConfirmEntry ? "eye-slash" : "eye"} size={20} color="#777" />
            </TouchableOpacity>
          </View>

          <View style={{ display: 'none' }} id="recaptcha-container"></View>

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

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou s'inscrire avec</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialContainer}>
            <TouchableOpacity style={[styles.socialButton, styles.facebookButton]}>
              <FontAwesome name="facebook" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.socialButton, styles.googleButton]}>
              <FontAwesome name="google" size={20} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Déjà un compte ? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.signupLink}>Se connecter</Text>
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
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#333',
  },
  phonePrefix: {
    marginRight: 5,
    color: '#333',
    fontWeight: 'bold',
  },
  phoneInput: {
    flex: 1,
    marginLeft: 5,
  },
  eyeIcon: {
    padding: 10,
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: { 
    color: '#fff', 
    fontSize: 14, 
    marginHorizontal: 10 
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  facebookButton: {
    backgroundColor: '#3D0666',
  },
  googleButton: {
    backgroundColor: '#AD3C96',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signupText: {
    color: '#fff',
    fontSize: 14,
  },
  signupLink: {
    color: '#AD3C96',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default SignUpScreen;