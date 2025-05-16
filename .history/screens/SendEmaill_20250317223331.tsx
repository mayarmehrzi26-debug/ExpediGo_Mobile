import axios from "axios";
import React, { useState } from "react";
import { Alert, Button, TextInput, View } from "react-native";
const SendEmaill = () => {
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
  
    const handleSendEmail = async () => {
      try {
        const response = await axios.post("http://192.168.199.160:5000/send-email", {
          to: email,
          subject,
          text: message,
        });
  
        Alert.alert("Succès", response.data.message);
      } catch (error) {
        Alert.alert("Erreur", "Échec de l'envoi de l'email");
      }
    };
  
    return (
      <View style={{ padding: 20 }}>
        <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={{ borderWidth: 1, marginBottom: 10, padding: 10 }} />
        <TextInput placeholder="Sujet" value={subject} onChangeText={setSubject} style={{ borderWidth: 1, marginBottom: 10, padding: 10 }} />
        <TextInput placeholder="Message" value={message} onChangeText={setMessage} style={{ borderWidth: 1, marginBottom: 10, padding: 10 }} />
        <Button title="Envoyer Email" onPress={handleSendEmail} />
      </View>
    );
  };
  

export default SendEmaill