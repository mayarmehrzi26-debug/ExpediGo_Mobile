import React from "react";
import { Alert, Button, View } from "react-native";
import sendEmail from "../src/services/emailService";
const EmailScreen: React.FC = () => {
    const handleSendEmail = async () => {
      try {
        await sendEmail("Test Email", "John Doe", "john.doe@example.com");
        Alert.alert("Succès", "Email envoyé !");
      } catch (error) {
        Alert.alert("Erreur", "L'email n'a pas été envoyé.");
      }
    };
  
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Button title="Envoyer un email" onPress={handleSendEmail} />
      </View>
    );
  };
  
  export default EmailScreen;