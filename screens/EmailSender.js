// EmailSender.js
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';

const EmailSender = () => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendEmail = async () => {
    if (!to || !subject || !text) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://192.168.196.160:3001/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to, subject, text }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Succès', data.message);
        setTo('');
        setSubject('');
        setText('');
      } else {
        throw new Error(data.error || 'Échec de l\'envoi de l\'email');
      }
    } catch (error) {
      Alert.alert('Erreur', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Envoyerrrr un email</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Destinataire"
        value={to}
        onChangeText={setTo}
        keyboardType="email-address"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Sujet"
        value={subject}
        onChangeText={setSubject}
      />
      
      <TextInput
        style={[styles.input, styles.multilineInput]}
        placeholder="Message"
        value={text}
        onChangeText={setText}
        multiline
        numberOfLines={4}
      />
      
      <Button
        title={isLoading ? 'Envoi en cours...' : 'Envoyer'}
        onPress={handleSendEmail}
        disabled={isLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
});

export default EmailSender;