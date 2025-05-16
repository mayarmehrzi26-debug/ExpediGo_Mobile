import OTPInputView from "@twotalltotems/react-native-otp-input";
import React, { useState } from "react";
import { Alert, Button, StyleSheet, Text, View } from "react-native";

const OtpVerificationScreen = ({ route, navigation }) => {
  const { confirmation } = route.params;
  const [code, setCode] = useState("");

  const verifyOTP = async () => {
    try {
      await confirmation.confirm(code);
      Alert.alert("Connexion réussie !");
      navigation.navigate("Home");
    } catch (error) {
      Alert.alert("Code incorrect !");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Entrez le code</Text>
      <Text>Nous avons envoyé un SMS avec un code d'activation.</Text>

      <OTPInputView
        style={styles.otpContainer}
        pinCount={6}
        code={code}
        onCodeChanged={setCode}
        autoFocusOnLoad
        codeInputFieldStyle={styles.otpInput}
      />

      <Button title="Vérifier" onPress={verifyOTP} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  otpContainer: { width: "80%", height: 100, alignSelf: "center" },
  otpInput: { borderBottomWidth: 2, width: 40, height: 40, fontSize: 20 },
});

export default OtpVerificationScreen;
