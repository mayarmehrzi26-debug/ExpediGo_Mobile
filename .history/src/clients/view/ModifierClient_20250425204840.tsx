import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { ClientService } from '../models/ClientModel';
import { ListeClientsPresenter } from '../presenters/ListeClientsPresenter';

const ModifierClient = ({ route, navigation }) => {
  const { clientId } = route.params;
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    latitude: 0,
    longitude: 0
  });

  const presenter = new ListeClientsPresenter({
    setClients: () => {},
    setLoading: (isLoading) => setLoading(isLoading),
    setRefreshing: () => {},
    showError: (title, message) => Alert.alert(title, message),
    showConfirmation: () => {},
    showSuccess: (message) => Alert.alert("Succès", message),
  }, navigation);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        setLoading(true);
        const clientData = await ClientService.getClientById(clientId);
        
        if (!clientData) {
          throw new Error('Client non trouvé');
        }

        setClient(clientData);
        setFormData({
          name: clientData.name,
          phone: clientData.phone,
          email: clientData.email,
          address: clientData.address,
          latitude: clientData.latitude || 0,
          longitude: clientData.longitude || 0
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching client:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [clientId]);

  const handleUpdate = async () => {
    try {
      await presenter.updateClient(clientId, formData);
    } catch (error) {
      setError('Échec de la mise à jour: ' + error.message);
    }
  };

  if (loading && !client) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#877DAB" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Retour" onPress={() => navigation.goBack()} />
      </View>
    );
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

// ... (les styles restent les mêmes)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F7F7F7',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    margin: 20,
    fontSize: 16,
  },
});

export default ModifierClient;