// ModifierClient.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { ClientService } from '../models/ClientModel';
import { ListeClientsPresenter } from '../presenters/ListeClientsPresenter';

const ModifierClient = ({ route, navigation }) => {
  const { clientId } = route.params;
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  });

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const clientData = await ClientService.getClientById(clientId);
        setClient(clientData);
        setFormData({
          name: clientData.name,
          phone: clientData.phone,
          email: clientData.email,
          address: clientData.address,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [clientId]);

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const presenter = new ListeClientsPresenter({
        // Implémentation minimale pour le presenter
        setClients: () => {},
        setLoading: () => {},
        setRefreshing: () => {},
        showError: (title, message) => Alert.alert(title, message),
        showConfirmation: () => {},
      }, navigation);
      
      await presenter.updateClient(clientId, formData);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le client');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !client) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={formData.name}
        onChangeText={(text) => setFormData({...formData, name: text})}
        placeholder="Nom"
      />
      <TextInput
        style={styles.input}
        value={formData.phone}
        onChangeText={(text) => setFormData({...formData, phone: text})}
        placeholder="Téléphone"
      />
      <TextInput
        style={styles.input}
        value={formData.email}
        onChangeText={(text) => setFormData({...formData, email: text})}
        placeholder="Email"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        value={formData.address}
        onChangeText={(text) => setFormData({...formData, address: text})}
        placeholder="Adresse"
      />
      
      <Button 
        title="Mettre à jour" 
        onPress={handleUpdate} 
        disabled={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
  },
});

export default ModifierClient;