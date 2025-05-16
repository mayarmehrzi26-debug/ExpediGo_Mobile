import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { updateEmballageStatus } from '../services/EmballageService';

const EmballageDetailsScreen = ({ route, navigation }) => {
  const { emballage } = route.params;
  const [status, setStatus] = useState(emballage.status);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [destinationLocation] = useState({
    latitude: 36.8085,
    longitude: 10.1835
  });
  const [locationWatchId, setLocationWatchId] = useState(null);
  const [distanceToDestination, setDistanceToDestination] = useState(null);
  
  // Fonction pour calculer la distance entre deux points en mètres
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Rayon de la Terre en mètres
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  // Démarrer le suivi de position
  const startLocationTracking = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'La localisation est nécessaire pour le suivi de livraison');
      return;
    }

    // Démarrer le watch
    const watchId = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 10, // Mettre à jour tous les 10 mètres
        timeInterval: 5000 // Ou toutes les 5 secondes
      },
      (location) => {
        const newLocation = location.coords;
        setUserLocation(newLocation);
        
        // Calculer la distance
        const distance = getDistance(
          newLocation.latitude,
          newLocation.longitude,
          destinationLocation.latitude,
          destinationLocation.longitude
        );
        setDistanceToDestination(Math.round(distance));
        
        // Vérifier la proximité seulement si en cours de livraison
        if (status === "En cours de livraison") {
          // Si à moins de 100 mètres, proposer la confirmation
          if (distance < 100 && distance > 0) {
            Alert.alert(
              "Vous êtes arrivé à destination",
              "Voulez-vous terminer la livraison maintenant?",
              [
                {
                  text: "Plus tard",
                  style: "cancel"
                },
                {
                  text: "Terminer",
                  onPress: handleCompleteDelivery
                }
              ]
            );
          }
        }
      }
    );
    
    setLocationWatchId(watchId);
  };

  // Arrêter le suivi de position
  const stopLocationTracking = () => {
    if (locationWatchId) {
      locationWatchId.remove();
      setLocationWatchId(null);
    }
  };

  useEffect(() => {
    if (status === "En cours de livraison") {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }
    
    return () => {
      stopLocationTracking();
    };
  }, [status]);

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

  const handleOpenChat = () => {
    setChatModalVisible(true);
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMsg = {
        text: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: 'me'
      };
      setMessages([...messages, newMsg]);
      setNewMessage('');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
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
            {userLocation && (
              <Marker
                coordinate={{ 
                  latitude: userLocation.latitude, 
                  longitude: userLocation.longitude 
                }}
                title="Votre position"
                pinColor="blue"
              />
            )}
            <Marker
              coordinate={{ 
                latitude: destinationLocation.latitude, 
                longitude: destinationLocation.longitude 
              }}
              title="Destination"
              pinColor="red"
            />
          </MapView>
        </View>

        {status === "En cours de livraison" && distanceToDestination !== null && (
          <View style={[
            styles.proximityAlert, 
            distanceToDestination < 100 ? styles.proximityAlertClose : styles.proximityAlertFar
          ]}>
            <Text style={styles.proximityAlertText}>
              Distance jusqu'à destination: {distanceToDestination} mètres
            </Text>
          </View>
        )}

        {/* Section Contact Client */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client</Text>
          
          <View style={styles.contactCard}>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{emballage.userInfo.displayName || 'Non spécifié'}</Text>
              {emballage.userInfo?.phone && (
                <Text style={styles.contactPhone}>{emballage.userInfo.phone}</Text>
              )}
            </View>
            
            <View style={styles.contactActions}>
              {emballage.userInfo?.phone && (
                <>
                  <TouchableOpacity 
                    style={styles.iconButton}
                    onPress={handleOpenChat}>
                    <MaterialIcons name="message" size={24} color="#44076a" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.iconButton}
                    onPress={() => Alert.alert("Appeler", `Appeler ${emballage.userInfo.displayName}`)}>
                    <MaterialIcons name="phone" size={24} color="#44076a" />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
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

      {/* Modal de chat */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={chatModalVisible}
        onRequestClose={() => setChatModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Discussion avec {emballage.userInfo.displayName}</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setChatModalVisible(false)}>
              <MaterialIcons name="close" size={24} color="#44076a" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.chatArea}
            contentContainerStyle={styles.chatContent}>
            {messages.map((msg, index) => (
              <View key={index} style={[
                styles.messageBubble,
                msg.sender === 'me' ? styles.myMessage : styles.theirMessage
              ]}>
                <Text style={styles.messageText}>{msg.text}</Text>
                <Text style={styles.messageTime}>{msg.time}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.messageInputContainer}>
            <TextInput
              style={styles.messageInput}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Écrire un message..."
              multiline
            />
            <TouchableOpacity 
              style={styles.sendButton}
              onPress={handleSendMessage}>
              <MaterialIcons name="send" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
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
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    margin: 15,
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
  status: {
    fontWeight: 'bold',
  },
  statusAccepté: {
    color: '#2196F3',
  },
  statusEncoursdelivraison: {
    color: '#4CAF50',
  },
  statusLivré: {
    color: '#2E7D32',
  },
  statusRetour: {
    color: '#F44336',
  },
  mapContainer: {
    height: 250,
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  actionButton: {
    backgroundColor: '#44076a',
    borderRadius: 8,
    padding: 16,
    margin: 15,
    elevation: 2,
  },
  deliveryButton: {
    backgroundColor: '#4CAF50', 
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#44076a',
    marginBottom: 10,
  },
  contactCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  contactPhone: {
    color: '#44076a',
    marginTop: 5,
  },
  contactActions: {
    flexDirection: 'row',
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
  proximityAlert: {
    padding: 10,
    borderRadius: 5,
    margin: 15,
    marginBottom: 0,
  },
  proximityAlertClose: {
    backgroundColor: '#4CAF50',
  },
  proximityAlertFar: {
    backgroundColor: '#FF9800',
  },
  proximityAlertText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default EmballageDetailsScreen;