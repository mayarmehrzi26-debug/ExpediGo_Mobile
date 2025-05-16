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
    backgroundColor: '#F7F7F7',
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  mapContainer: {
    height: 350,
    width: '100%',
    marginBottom: 15,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  controls: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 5,
    elevation: 3,
  },
  controlButton: {
    padding: 8,
  },
  actionButton: {
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    elevation: 2,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#44076a',
    marginBottom: 15,
  },
  sectionTitle1: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#44076a',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailLabel: {
    fontWeight: 'bold',
    marginLeft: 10,
    width: 100,
    color: '#333',
  },
  detailValue: {
    flex: 1,
    color: '#666',
  },
  contactCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  contactLabel: {
    color: '#666',
    fontSize: 14,
    marginTop: 2,
  },
  contactPhone: {
    color: '#44076a',
    fontSize: 15,
    marginTop: 5,
  },
  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 10,
    backgroundColor: '#F0E6FF',
    borderRadius: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#44076a',
  },
  closeButton: {
    padding: 5,
  },
  chatArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  chatContent: {
    padding: 15,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ECECEC',
  },
  messageText: {
    fontSize: 16,
  },
  messageTime: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#44076a',
    borderRadius: 20,
    padding: 10,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressSection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  addressTitle: {
    marginLeft: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  addressText: {
    color: '#666',
    marginLeft: 30, // Pour aligner avec l'icône
  },
});

export default CommandeDetailsScreen;