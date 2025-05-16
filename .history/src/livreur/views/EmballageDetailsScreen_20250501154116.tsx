import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { updateEmballageStatus } from '../services/EmballageService';

const EmballageDetailsScreen = ({ route, navigation }) => {
  const { emballage } = route.params;
  const [status, setStatus] = useState(emballage.status);

  const handleStartDelivery = async () => {
    try {
      await updateEmballageStatus(emballage.id, "En cours de livraison");
      setStatus("En cours de livraison");
      Alert.alert("Succès", "Livraison commencée");
    } catch (error) {
      Alert.alert("Erreur", "Impossible de démarrer la livraison");
    }
  };

  const handleCompleteDelivery = (isDelivered: boolean) => {
    Alert.alert(
      "Confirmation",
      isDelivered ? "Confirmez-vous la livraison ?" : "Le colis est-il retourné ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Confirmer", 
          onPress: async () => {
            try {
              const newStatus = isDelivered ? "Livré" : "Retour";
              await updateEmballageStatus(emballage.id, newStatus);
              setStatus(newStatus);
              Alert.alert("Succès", `Statut mis à jour: ${newStatus}`);
              navigation.goBack();
            } catch (error) {
              Alert.alert("Erreur", "Mise à jour échouée");
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Détails de la commande</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.label}>N° Commande:</Text>
          <Text style={styles.value}>{emballage.id}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.label}>Client:</Text>
          <Text style={styles.value}>{emballage.userInfo.displayName}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.label}>Adresse:</Text>
          <Text style={styles.value}>{emballage.addressInfo.fullAddress}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.label}>Statut:</Text>
          <Text style={[styles.status, styles[`status${status.replace(/\s/g, '')}`]]}>
            {status}
          </Text>
        </View>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 36.8065,
            longitude: 10.1815,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker
            coordinate={{ latitude: 36.8065, longitude: 10.1815 }}
            title="Votre position"
            pinColor="blue"
          />
          <Marker
            coordinate={{ latitude: 36.8085, longitude: 10.1835 }}
            title="Destination"
            pinColor="red"
          />
        </MapView>
      </View>

      {status === "Accepté" && (
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleStartDelivery}
        >
          <Text style={styles.buttonText}>Commencer la livraison</Text>
        </TouchableOpacity>
      )}

      {status === "En cours de livraison" && (
        <View style={styles.buttonGroup}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.successButton]}
            onPress={() => handleCompleteDelivery(true)}
          >
            <Text style={styles.buttonText}>Livraison réussie</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.dangerButton]}
            onPress={() => handleCompleteDelivery(false)}
          >
            <Text style={styles.buttonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F7F7F7',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#44076a',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
    color: '#555',
  },
  value: {
    color: '#333',
  },
  mapContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#44076a',
  },
  map: {
    height: 300,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#877DAB',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  successButton: {
    backgroundColor: '#4CAF50',
    flex: 1,
    marginRight: 8,
  },
  dangerButton: {
    backgroundColor: '#F44336',
    flex: 1,
    marginLeft: 8,
  },
  statusNontrait: {
    color: '#FFA500',
    fontWeight: 'bold',
  },
  statusEncoursdelivraison: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  statusLivr: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  statusRetour: {
    color: '#F44336',
    fontWeight: 'bold',
  },
});

export default EmballageDetailsScreen;