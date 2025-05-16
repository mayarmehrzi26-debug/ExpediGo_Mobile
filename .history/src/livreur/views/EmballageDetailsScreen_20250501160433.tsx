import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { updateEmballageStatus } from '../services/EmballageService';

const EmballageDetailsScreen = ({ route, navigation }) => {
    const { emballage } = route.params;
    const [status, setStatus] = useState(emballage.status);
  
    const handleStartDelivery = async () => {
      try {
        await updateEmballageStatus(emballage.id, "En cours de livraison");
        setStatus("En cours de livraison");
        Alert.alert("Succès", "Livraison commencée - Vous pouvez maintenant vous rendre chez le client");
      } catch (error) {
        Alert.alert("Erreur", "Impossible de démarrer la livraison");
      }
    };
  
    const handleCompleteDelivery = () => {
      Alert.alert(
        "Confirmation de livraison",
        "Avez-vous livré le colis au client ?",
        [
          {
            text: "Non (Retour)",
            onPress: async () => {
              try {
                await updateEmballageStatus(emballage.id, "Retour");
                setStatus("Retour");
                Alert.alert("Retour enregistré", "Le colis a été marqué comme retourné");
                navigation.goBack();
              } catch (error) {
                Alert.alert("Erreur", "Impossible d'enregistrer le retour");
              }
            },
            style: "destructive"
          },
          {
            text: "Oui (Livré)",
            onPress: async () => {
              try {
                await updateEmballageStatus(emballage.id, "Livré");
                setStatus("Livré");
                Alert.alert("Livraison confirmée", "Le colis a été marqué comme livré avec succès");
                navigation.goBack();
              } catch (error) {
                Alert.alert("Erreur", "Impossible de confirmer la livraison");
              }
            }
          }
        ],
        { cancelable: true }
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
        <TouchableOpacity 
          style={[styles.actionButton, styles.deliveryButton]}
          onPress={handleCompleteDelivery}
        >
          <Text style={styles.buttonText}>Terminer la livraison</Text>
        </TouchableOpacity>
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
  }
  actionButton: {
    backgroundColor: '#44076a',
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
    textAlign: 'center',

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