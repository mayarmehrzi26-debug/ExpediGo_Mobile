import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const SignUpScreen = () => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  const validateTunisianPhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '');
    return /^[24579]\d{7}$/.test(cleaned);
  };

  const handleSendOTP = async () => {
    const cleanedPhone = phone.replace(/\D/g, '');
    const phoneNumber = `+216${cleanedPhone}`;

    if (!validateTunisianPhone(phone)) {
      Alert.alert("Erreur", "Numéro tunisien invalide.");
      return;
    }

    try {
      setLoading(true);
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      navigation.navigate('OTPScreen', { confirmation, phone: phoneNumber });
    } catch (error) {
      console.error("Erreur OTP:", error);
      Alert.alert("Erreur", "Impossible d'envoyer le code. Vérifie le numéro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inscription - Vérification Téléphone</Text>
      <TextInput
        style={styles.input}
        placeholder="Numéro de téléphone (ex: 20 123 456)"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        maxLength={11}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleSendOTP}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Envoyer OTP</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#AD3C96',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});
