import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { updateLivraisonStatus } from '../services/commandeService';

const DISTANCE_THRESHOLD = 0.05; // ~50 mètres en degrés

const CommandeDetailsScreen = ({ route }) => {
  const { commande: initialCommande } = route.params;
  const [commande, setCommande] = useState(initialCommande);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showOriginRoute, setShowOriginRoute] = useState(false);
  const [showDestinationRoute, setShowDestinationRoute] = useState(false);
  const [locationSubscription, setLocationSubscription] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const mapRef = useRef(null);
  const scrollViewRef = useRef(null);

  // Vérification des coordonnées
  const hasValidOrigin = commande?.originLat && commande?.originLng;
  const hasValidDestination = commande?.destinationLat && commande?.destinationLng;

  // Calcul de la distance entre deux points
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2));
  };

  // Vérification de la proximité
  const checkProximity = (location) => {
    if (!location) return;

    // Vérifier si on est proche de l'origine
    if (hasValidOrigin && commande.status === "En attente d'enlèvement") {
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        commande.originLat,
        commande.originLng
      );
      
      if (distance < DISTANCE_THRESHOLD) {
        Alert.alert(
          "Confirmation",
          "Vous êtes arrivé à l'origine. Avez-vous pris le colis ?",
          [
            {
              text: "Non",
              style: "cancel"
            },
            { 
              text: "Oui",
              onPress: () => handleStatusUpdate("Picked")
            }
          ]
        );
      }
    }

    // Vérifier si on est proche de la destination
    if (hasValidDestination && commande.status === "En cours de livraison") {
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        commande.destinationLat,
        commande.destinationLng
      );
      
      if (distance < DISTANCE_THRESHOLD) {
        Alert.alert(
          "Confirmation",
          "Vous êtes arrivé à destination. Avez-vous livré le colis ?",
          [
            {
              text: "Non",
              style: "cancel"
            },
            { 
              text: "Oui",
              onPress: () => handleStatusUpdate("Livré")
            },
            {
              text: "Problème",
              onPress: () => handleStatusUpdate("Retour"),
              style: "destructive"
            }
          ]
        );
      }
    }
  };

  // Fonction pour passer un appel téléphonique
  const handleCall = async (phoneNumber) => {
    const cleanedPhoneNumber = phoneNumber.replace(/[^0-9+]/g, '');
    
    if (!cleanedPhoneNumber) {
      Alert.alert("Erreur", "Numéro de téléphone invalide");
      return;
    }

    const phoneUrl = `tel:${cleanedPhoneNumber}`;

    try {
      const canOpen = await Linking.canOpenURL(phoneUrl);
      
      if (canOpen) {
        await Linking.openURL(phoneUrl);
      } else {
        Alert.alert(
          "Appel non disponible",
          "Votre appareil ne peut pas passer d'appels téléphoniques",
          [
            {
              text: "Copier le numéro",
              onPress: () => {
                Clipboard.setString(cleanedPhoneNumber);
                Alert.alert("Numéro copié", "Vous pouvez maintenant le coller dans votre application téléphone");
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error("Erreur d'appel:", error);
      Alert.alert(
        "Erreur",
        "Impossible de passer l'appel",
        [
          {
            text: "OK",
            style: "cancel"
          },
          {
            text: "Ouvrir le clavier",
            onPress: () => Linking.openURL(`telprompt:${cleanedPhoneNumber}`)
          }
        ]
      );
    }
  };

  // Fonction pour confirmer l'appel
  const confirmCall = (phoneNumber, contactName) => {
    Alert.alert(
      "Confirmer l'appel",
      `Voulez-vous appeler ${contactName} au ${phoneNumber} ?`,
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        { 
          text: "Appeler",
          onPress: () => handleCall(phoneNumber)
        }
      ]
    );
  };

  // Fonction pour envoyer un SMS
  const handleSMS = async (phoneNumber) => {
    setShowChat(true);
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Fonction pour envoyer un message dans le chat
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMsg = {
        text: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: 'me'
      };
      setMessages([...messages, newMsg]);
      setNewMessage('');
      
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  // Récupération position utilisateur avec suivi
  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          // Position initiale
          const location = await Location.getCurrentPositionAsync({});
          if (isMounted) {
            setUserLocation({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            });
            checkProximity({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            });
          }

          // Abonnement aux mises à jour de position
          const sub = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.High,
              distanceInterval: 10,
              timeInterval: 5000,
            },
            (location) => {
              if (isMounted) {
                setUserLocation({
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                });
                checkProximity({
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                });
              }
            }
          );
          setLocationSubscription(sub);
        }
      } catch (error) {
        console.warn('Erreur de localisation:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [commande.status]);

  // Calcul du point central et du zoom
  const calculateRegion = () => {
    const points = [];
    
    if (userLocation) points.push(userLocation);
    if (hasValidOrigin) points.push({
      latitude: commande.originLat,
      longitude: commande.originLng
    });
    if (hasValidDestination) points.push({
      latitude: commande.destinationLat,
      longitude: commande.destinationLng
    });

    if (points.length === 0) {
      return {
        latitude: 48.8566,
        longitude: 2.3522,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      };
    }

    // Calcul des limites
    let minLat = points[0].latitude;
    let maxLat = points[0].latitude;
    let minLng = points[0].longitude;
    let maxLng = points[0].longitude;

    points.forEach(point => {
      minLat = Math.min(minLat, point.latitude);
      maxLat = Math.max(maxLat, point.latitude);
      minLng = Math.min(minLng, point.longitude);
      maxLng = Math.max(maxLng, point.longitude);
    });

    const padding = 0.05;
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: (maxLat - minLat) + padding,
      longitudeDelta: (maxLng - minLng) + padding,
    };
  };

  // Zoom sur tous les points
  const zoomToMarkers = () => {
    if (!mapRef.current) return;

    const coordinates = [];
    if (userLocation) coordinates.push(userLocation);
    if (hasValidOrigin) coordinates.push({
      latitude: commande.originLat,
      longitude: commande.originLng
    });
    if (hasValidDestination) coordinates.push({
      latitude: commande.destinationLat,
      longitude: commande.destinationLng
    });

    if (coordinates.length > 0) {
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
        animated: true,
      });
    }
  };

  // Mise à jour locale du statut
  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      const success = await updateLivraisonStatus(commande.id, newStatus);
      if (success) {
        setCommande(prev => ({ ...prev, status: newStatus }));
        
        if (newStatus === "Picked") {
          setShowOriginRoute(false);
          setShowDestinationRoute(false);
        } else if (newStatus === "En cours de livraison") {
          setShowOriginRoute(false);
          setShowDestinationRoute(true);
        } else if (newStatus === "En attente d'enlèvement") {
          setShowOriginRoute(true);
          setShowDestinationRoute(false);
        } else {
          setShowOriginRoute(false);
          setShowDestinationRoute(false);
        }
        
        Alert.alert('Succès', 'Statut mis à jour avec succès');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Échec de la mise à jour');
    } finally {
      setUpdating(false);
    }
  };

  // Actions selon le statut actuel
  const handleMainAction = () => {
    switch (commande.status) {
      case "Non traité":
        handleStatusUpdate("En attente d'enlèvement");
        setShowOriginRoute(true);
        break;
      case "En attente d'enlèvement":
        handleStatusUpdate("Picked");
        setShowOriginRoute(false);
        break;
      case "Picked":
        handleStatusUpdate("En cours de livraison");
        setShowDestinationRoute(true);
        break;
      case "En cours de livraison":
        Alert.alert(
          "Confirmer la livraison",
          "Avez-vous livré le colis au destinataire ?",
          [
            {
              text: "Annuler",
              style: "cancel"
            },
            { 
              text: "Livraison réussie",
              onPress: () => handleStatusUpdate("Livré")
            },
            {
              text: "Retour/Problème",
              onPress: () => handleStatusUpdate("Retour"),
              style: "destructive"
            }
          ]
        );
        break;
    }
  };

  const openMaps = (lat, lng, label) => {
    const url = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;
    Linking.openURL(url).catch(err => Alert.alert('Erreur', 'Impossible d\'ouvrir la carte'));
  };

  // Texte et couleur du bouton principal
  const getActionButtonInfo = () => {
    switch (commande.status) {
      case "Non traité": 
        return { text: "Prendre en charge", color: "#44076a" };
      case "En attente d'enlèvement": 
        return { text: "Commencer le pickup", color: "#877DAB" };
      case "Picked": 
        return { text: "Commencer la livraison", color: "#5D8BF4" };
      case "En cours de livraison": 
        return { text: "Terminer la livraison", color: "#4CAF50" };
      default: 
        return { text: "", color: "#44076a" };
    }
  };

  const { text: actionButtonText, color: actionButtonColor } = getActionButtonInfo();
  const showActionButton = ["Non traité", "En attente d'enlèvement", "Picked", "En cours de livraison"].includes(commande.status);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#44076a" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        ref={scrollViewRef}
      >
        {/* Carte */}
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={calculateRegion()}
            onMapReady={zoomToMarkers}
          >
            {/* Marqueurs */}
            {userLocation && (
              <Marker
                coordinate={userLocation}
                title="Votre position"
                pinColor="#4285F4"
              />
            )}

            {hasValidOrigin && (
              <Marker
                coordinate={{
                  latitude: commande.originLat,
                  longitude: commande.originLng,
                }}
                title="Origine"
                description={commande.origin}
                pinColor="#FBBC05"
              />
            )}

            {hasValidDestination && (
              <Marker
                coordinate={{
                  latitude: commande.destinationLat,
                  longitude: commande.destinationLng,
                }}
                title="Destination"
                description={commande.destination}
                pinColor="#34A853"
              />
            )}

            {/* Ligne entre origine et destination */}
            {hasValidOrigin && hasValidDestination && (
              <Polyline
                coordinates={[
                  { latitude: commande.originLat, longitude: commande.originLng },
                  { latitude: commande.destinationLat, longitude: commande.destinationLng },
                ]}
                strokeColor="#44076a"
                strokeWidth={4}
              />
            )}

            {/* Trajet vers l'origine (quand en attente de pickup) */}
            {showOriginRoute && userLocation && hasValidOrigin && (
              <Polyline
                coordinates={[
                  userLocation,
                  { latitude: commande.originLat, longitude: commande.originLng },
                ]}
                strokeColor="#FBBC05"
                strokeWidth={4}
                lineDashPattern={[5, 5]}
              />
            )}

            {/* Trajet vers la destination (quand en cours de livraison) */}
            {showDestinationRoute && userLocation && hasValidDestination && (
              <Polyline
                coordinates={[
                  userLocation,
                  { latitude: commande.destinationLat, longitude: commande.destinationLng },
                ]}
                strokeColor="#34A853"
                strokeWidth={4}
                lineDashPattern={[5, 5]}
              />
            )}
          </MapView>

          {/* Boutons de contrôle */}
          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={zoomToMarkers}>
              <MaterialIcons name="zoom-out-map" size={24} color="#44076a" />
            </TouchableOpacity>

            {hasValidOrigin && (
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => openMaps(commande.originLat, commande.originLng, 'Origine')}>
                <MaterialIcons name="directions" size={24} color="#44076a" />
              </TouchableOpacity>
            )}

            {hasValidDestination && (
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => openMaps(commande.destinationLat, commande.destinationLng, 'Destination')}>
                <MaterialIcons name="flag" size={24} color="#44076a" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Bouton d'action principal */}
        {showActionButton && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: actionButtonColor }]}
            onPress={handleMainAction}
            disabled={updating}>
            {updating ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.actionButtonText}>{actionButtonText}</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Détails de la commande */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détails de livraison</Text>
          
          <View style={styles.detailRow}>
            <MaterialIcons name="local-shipping" size={20} color="#44076a" />
            <Text style={styles.detailLabel}>N° Commande:</Text>
            <Text style={styles.detailValue}>{commande.id}</Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialIcons name="event" size={20} color="#44076a" />
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>{commande.date}</Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialIcons name="info" size={20} color="#44076a" />
            <Text style={styles.detailLabel}>Statut:</Text>
            <Text style={[styles.detailValue, { color: actionButtonColor, fontWeight: 'bold' }]}>
              {commande.status}
            </Text>
          </View>
        </View>

        {/* Section Expéditeur */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expéditeur</Text>
          
          <View style={styles.contactCard}>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{commande.createdBy?.name || 'Non spécifié'}</Text>
              <Text style={styles.contactLabel}>Responsable de la commande</Text>
              {commande.createdBy?.phone && (
                <Text style={styles.contactPhone}>{commande.createdBy.phone}</Text>
              )}
            </View>
            
            <View style={styles.contactActions}>
              {commande.createdBy?.phone && (
                <>
                  <TouchableOpacity 
                    style={styles.iconButton}
                    onPress={() => handleSMS(commande.createdBy.phone)}>
                    <MaterialIcons name="message" size={24} color="#44076a" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.iconButton}
                    onPress={() => confirmCall(commande.createdBy.phone, commande.createdBy.name)}>
                    <MaterialIcons name="phone" size={24} color="#44076a" />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Section Destinataire */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Destinataire</Text>
          
          <View style={styles.contactCard}>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{commande.clientName || 'Non spécifié'}</Text>
              <Text style={styles.contactLabel}>Client</Text>
              {commande.clientPhone && (
                <Text style={styles.contactPhone}>{commande.clientPhone}</Text>
              )}
            </View>
            
            <View style={styles.contactActions}>
              {commande.client?.phone && (
                <>
                  <TouchableOpacity 
                    style={styles.iconButton}
                    onPress={() => handleSMS(commande.client.phone)}>
                    <MaterialIcons name="message" size={24} color="#44076a" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.iconButton}
                    onPress={() => confirmCall(commande.client.phone, commande.client.name)}>
                    <MaterialIcons name="phone" size={24} color="#44076a" />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Section Messages (affichée seulement quand showChat est true) */}
        {showChat && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Messages</Text>
            
            <ScrollView style={styles.chatContainer}>
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
        )}
      </ScrollView>
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
    paddingVertical: 10,
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
  chatContainer: {
    maxHeight: 200,
    marginBottom: 10,
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
});

export default CommandeDetailsScreen;