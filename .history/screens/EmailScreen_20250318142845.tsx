import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";
import sendEmail from "../src/";

const EmailScreen: React.FC = () => {
  const [title, setTitle] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  const handleSendEmail = async () => {
    if (!title || !name || !email) {
      Alert.alert("Erreur", "Tous les champs sont obligatoires !");
      return;
    }

    try {
      await sendEmail(title, name, email);
      Alert.alert("Succès", "Email envoyé avec succès !");
    } catch (error) {
      Alert.alert("Erreur", "Impossible d’envoyer l’email.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Titre :</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} />

      <Text style={styles.label}>Nom :</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>Email :</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />

      <Button title="Envoyer l'email" onPress={handleSendEmail} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  label: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
});

export default EmailScreen;
