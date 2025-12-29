import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Location from 'expo-location';
import {
  doc,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { firebaseAuth, firebasestore } from "../../../FirebaseConfig";
import { LivraisonModel } from '../../livraison/models/LivraisonModel';
import { getMessages, sendMessage, setupMessagesListener, updateLivraisonStatus } from '../services/commandeService';

const DISTANCE_THRESHOLD = 0.05; // ~50 mètres en degrés

const CommandeDetailsScreen = ({ route, navigation }) => {
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
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [currentChatUser, setCurrentChatUser] = useState(null);
  const mapRef = useRef(null);
  const scrollViewRef = useRef(null);
  const chatScrollRef = useRef(null);
  const unsubscribeRef = useRef(null);
  const livraisonModel = useRef(new LivraisonModel()).current;
  const [destinataire, setDestinataire] = useState(null);
  const [livreurPosition, setLivreurPosition] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const trackingUnsubscribeRef = useRef(null);
  const [products, setProducts] = useState<Array<{
    id: string;
    name: string;
    description: string;
    quantity: number;
    price: number;
    image?: string;
  }>>([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productModalVisible, setProductModalVisible] = useState(false);

  useEffect(() => {
   const loadCommandeDetails = async () => {
  try {
    setLoading(true);
    const commandeDetails = await livraisonModel.getCommandeById(commande.id);
    
    if (!commandeDetails) {
      console.log('Commande non trouvée');
      return;
    }

    // Mettre à jour les produits
    const loadedProducts = commandeDetails.products || [];
    const productsWithDetails = await Promise.all(
      loadedProducts.map(async (item) => {
        const productDetails = await livraisonModel.getProductById(item.productId);
        return {
          id: item.productId,
          name: productDetails?.name || `Produit ${item.productId}`,
          description: productDetails?.description || '',
          quantity: item.quantity || 1,
          price: item.price || productDetails?.price || 0,
          image: productDetails?.imageUrl
        };
      })
    );

    // Calculer le montant total
    const calculatedAmount = productsWithDetails.reduce((total, product) => {
      return total + (product.price || 0) * (product.quantity || 1);
    }, 0);

    // Récupérer les détails de l'expéditeur
    let expediteurDetails = null;
    if (commandeDetails.createdBy) {
      if (typeof commandeDetails.createdBy === 'string') {
        // Si createdBy est un string (ID), on récupère les détails
        expediteurDetails = await livraisonModel.getUserById(commandeDetails.createdBy) 
                          || await livraisonModel.getClientById(commandeDetails.createdBy);
      } else {
        // Si createdBy est déjà un objet, on l'utilise directement
        expediteurDetails = commandeDetails.createdBy;
      }
    }

    setCommande(prev => ({
      ...prev,
      ...commandeDetails,
      totalAmount: calculatedAmount,
      payment: commandeDetails.payment || 'Non spécifié',
      createdBy: expediteurDetails || commandeDetails.createdBy // Garde l'original si pas de détails
    }));

    setProducts(productsWithDetails);
    
    // Charger le destinataire
    const destinataireData = await livraisonModel.getDestinataireByCommandeId(commande.id);
    setDestinataire(destinataireData);

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    setLoading(false);
  }
};

    loadCommandeDetails();
  }, [commande.id]);

  const hasValidOrigin = commande?.originLat && commande?.originLng;
  const hasValidDestination = commande?.destinationLat && commande?.destinationLng;

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2));
  };

  const checkProximity = (location) => {
    if (!location) return;

    // Détection pour le pickup
    if (hasValidOrigin && commande.status === "En cours de pickup") {
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
            { text: "Non", style: "cancel" },
            { 
              text: "Oui", 
              onPress: () => handleStatusUpdate("Picked")
            }
          ]
        );
      }
    }

    // Détection pour la livraison
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
            { text: "Non", style: "cancel" },
            { text: "Oui", onPress: () => handleStatusUpdate("Livré") },
            { 
              text: "Retour", 
              onPress: () => handleStatusUpdate("Retour"), 
              style: "destructive" 
            }
          ]
        );
      }
    }
  };

  const updateLivreurTracking = async (location, status) => {
    try {
      const user = firebaseAuth.currentUser;
      if (!user) return;

      await livraisonModel.updateOrCreateLivreurPosition(user.uid, {
        latitude: location.latitude,
        longitude: location.longitude,
        commandeId: commande.id,
        status: status,
        livreurName: user.displayName || 'Livreur'
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la position du livreur:", error);
    }
  };

  const startTracking = async (status) => {
    try {
      const { status: permissionStatus } = await Location.requestForegroundPermissionsAsync();
      if (permissionStatus !== 'granted') {
        Alert.alert('Permission refusée', 'La localisation est nécessaire pour le suivi');
        return;
      }
  
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
  
      await livraisonModel.updateOrCreateLivreurPosition(
        firebaseAuth.currentUser?.uid, 
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          commandeId: commande.id,
          status: status,
          livreurName: firebaseAuth.currentUser?.displayName || 'Livreur',
          assignedTo: firebaseAuth.currentUser?.uid
        }
      );
  
      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10,
          timeInterval: 5000,
        },
        async (newLocation) => {
          const newCoords = {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
          };
          setUserLocation(newCoords);
          checkProximity(newCoords);
          await livraisonModel.updateOrCreateLivreurPosition(
            firebaseAuth.currentUser?.uid,
            {
              latitude: newLocation.coords.latitude,
              longitude: newLocation.coords.longitude,
              commandeId: commande.id,
              status: status,
              assignedTo: firebaseAuth.currentUser?.uid
            }
          );
        }
      );
      setLocationSubscription(sub);
    } catch (error) {
      console.error("Erreur lors du démarrage du suivi:", error);
    }
  };

  const stopTracking = () => {
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
  };

  useEffect(() => {
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
      if (trackingUnsubscribeRef.current) {
        trackingUnsubscribeRef.current();
      }
    };
  }, []);

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
          "Votre appareil ne peut pas passer d'appels téléphoniques"
        );
      }
    } catch (error) {
      console.error("Erreur d'appel:", error);
      Alert.alert("Erreur", "Impossible de passer l'appel");
    }
  };

  const confirmCall = (phoneNumber, contactName) => {
    Alert.alert(
      "Confirmer l'appel",
      `Voulez-vous appeler ${contactName} au ${phoneNumber} ?`,
      [
        { text: "Annuler", style: "cancel" },
        { text: "Appeler", onPress: () => handleCall(phoneNumber) }
      ]
    );
  };

  const handleStartConversation = async (userId, userName) => {
    try {
      const currentUser = firebaseAuth.currentUser;
      if (!currentUser) {
        Alert.alert("Erreur", "Vous devez être connecté pour envoyer des messages");
        return;
      }
  
      const recipientUser = await livraisonModel.getUserById(userId) 
                        || await livraisonModel.getClientById(userId);
      
      if (!recipientUser) {
        Alert.alert("Erreur", "Le destinataire n'existe pas dans le système");
        return;
      }
  
      const participants = [currentUser.uid, userId];
      let conversationId = await livraisonModel.findExistingConversation(participants);
      
      if (!conversationId) {
        conversationId = await livraisonModel.createConversation(participants);
      }
  
      navigation.navigate('ChatScreen', { 
        conversationId,
        recipientName: userName
      });
    } catch (error) {
      console.error("Erreur lors du démarrage de la conversation:", error);
      Alert.alert("Erreur", error.message || "Impossible de démarrer la conversation");
    }
  };

  const handleOpenChat = (user) => {
    setCurrentChatUser(user);
    setChatModalVisible(true);
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() && currentChatUser && commande.id) {
      const user = firebaseAuth.currentUser;
      if (!user) return;

      const success = await sendMessage(
        commande.id, 
        newMessage, 
        {
          id: user.uid,
          name: user.displayName || 'Livreur'
        }
      );
      
      if (success) {
        setNewMessage('');
        setTimeout(() => {
          chatScrollRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
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
        }
      } catch (error) {
        console.warn('Erreur de localisation:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    switch (commande.status) {
      case "En cours de pickup":
        setShowOriginRoute(true);
        setShowDestinationRoute(false);
        break;
      case "Picked":
        setShowOriginRoute(false);
        setShowDestinationRoute(false);
        break;
      case "En cours de livraison":
        setShowOriginRoute(false);
        setShowDestinationRoute(true);
        break;
      default:
        setShowOriginRoute(false);
        setShowDestinationRoute(false);
        break;
    }
  }, [commande.status]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!commande.id) return;

      try {
        const initialMessages = await getMessages(commande.id);
        setMessages(initialMessages);
        
        unsubscribeRef.current = setupMessagesListener(commande.id, (updatedMessages) => {
          setMessages(updatedMessages);
          setTimeout(() => {
            chatScrollRef.current?.scrollToEnd({ animated: true });
          }, 100);
        });
      } catch (error) {
        console.error("Erreur lors du chargement des messages:", error);
      }
    };

    loadMessages();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [commande.id]);

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

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      const commandeActuelle = await livraisonModel.getCommandeById(commande.id);
      const montant = commandeActuelle.totalAmount;
    
      if (!commandeActuelle) {
        throw new Error("Commande introuvable");
      }
    
      const expediteurId = typeof commandeActuelle.createdBy === 'string' 
        ? commandeActuelle.createdBy 
        : commandeActuelle.createdBy?.id;
    
      await updateLivraisonStatus(commande.id, newStatus);
      setCommande(prev => ({ ...prev, status: newStatus }));
    
      if (newStatus === "En attente d'enlèvement") {
        const user = firebaseAuth.currentUser;
        if (user) {
          await sendPushNotification(
            [user.uid],
            "Vous avez pris une livraison",
            `Vous avez pris en charge la livraison #${commande.id}`,
            {
              commandeId: commande.id,
              status: newStatus,
              screen: 'CommandeDetails'
            }
          );
        }
      }
    
      if (newStatus === "En cours de pickup" || newStatus === "En cours de livraison") {
        await startTracking(newStatus);
        
        await updateDoc(doc(firebasestore, "livraisons", commande.id), {
          assignedTo: firebaseAuth.currentUser?.uid,
          status: newStatus
        });
      } else if (newStatus === "Livré" || newStatus === "Retour") {
        stopTracking();
        
        await livraisonModel.updateOrCreateLivreurPosition(
          firebaseAuth.currentUser?.uid,
          {
            latitude: 0,
            longitude: 0,
            status: 'inactive',
            timestamp: serverTimestamp()
          }
        );
      }
    
      if (newStatus === "Livré" && expediteurId) {
        if (montant > 0) {
          await livraisonModel.creditExpediteur(
            expediteurId, 
            montant,
            commande.id
          );
          Alert.alert('Succès', `Livraison confirmée (${montant}dt crédités à l'expéditeur)`);
        } else {
          Alert.alert('Succès', 'Livraison confirmée (pas de crédit nécessaire)');
        }
        return;
      }
    
      Alert.alert('Succès', 'Statut mis à jour');
    } catch (error) {
      console.error("Erreur complète:", error);
      Alert.alert('Erreur', error.message || "Échec de la mise à jour");
    } finally {
      setUpdating(false);
    }
  };

  const handleMainAction = () => {
    switch (commande.status) {
      case "Non traité":
        handleStatusUpdate("En attente d'enlèvement");
        break;
      case "En attente d'enlèvement":
        Alert.alert(
          "Confirmer le pickup",
          "Voulez-vous commencer le pickup ? Votre position sera partagée avec le client.",
          [
            { text: "Annuler", style: "cancel" },
            { 
              text: "Commencer", 
              onPress: () => handleStatusUpdate("En cours de pickup") 
            }
          ]
        );
        break;
      case "En cours de pickup":
        Alert.alert(
          "Confirmer le pickup",
          "Avez-vous pris le colis ?",
          [
            { text: "Non", style: "cancel" },
            { 
              text: "Oui", 
              onPress: () => handleStatusUpdate("Picked")
            }
          ]
        );
        break;
      case "Picked":
        Alert.alert(
          "Confirmer le départ",
          "Voulez-vous commencer la livraison ? Votre position sera partagée avec le client.",
          [
            { text: "Non", style: "cancel" },
            { 
              text: "Commencer", 
              onPress: () => handleStatusUpdate("En cours de livraison") 
            }
          ]
        );
        break;
      case "En cours de livraison":
        Alert.alert(
          "Confirmer la livraison",
          "Avez-vous livré le colis au destinataire ?",
          [
            { text: "Annuler", style: "cancel" },
            { text: "Livraison réussie", onPress: () => handleStatusUpdate("Livré") },
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
    Linking.openURL(url).catch(err => Alert.alert('Erreur', "Impossible d'ouvrir la carte"));
  };

  const getActionButtonInfo = () => {
    switch (commande.status) {
      case "En attente d'enlèvement": 
        return { text: "Commencer le pickup", color: "#44076a" };
      case "En cours de pickup": 
        return { text: "Terminer le pickup", color: "#877DAB" };
      case "Picked":
        return { text: "Commencer la livraison", color: "#5D8BF4" };
      case "En cours de livraison": 
        return { text: "Terminer la livraison", color: "#5D8BF4" };
      default: 
        return { text: "", color: "#44076a" };
    }
  };

  const { text: actionButtonText, color: actionButtonColor } = getActionButtonInfo();
  const showActionButton = ["En attente d'enlèvement", "En cours de pickup","Picked", "En cours de livraison"].includes(commande.status);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#44076a" />
      </View>
    );
  }

  const renderProductModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={productModalVisible}
      onRequestClose={() => setProductModalVisible(false)}
    >
      <View style={styles.centeredView}>
        <View style={styles.productModalView}>
          {selectedProduct && (
            <>
              <Text style={styles.productModalTitle}>{selectedProduct.name}</Text>
              
              {selectedProduct.image && (
                <Image 
                  source={{uri: selectedProduct.image}} 
                  style={styles.productImage}
                  resizeMode="contain"
                />
              )}
              
              <View style={styles.productDetailRow}>
                <Text style={styles.productDetailLabel}>Quantité:</Text>
                <Text style={styles.productDetailValue}>{selectedProduct.quantity}</Text>
              </View>
              
              <View style={styles.productDetailRow}>
                <Text style={styles.productDetailLabel}>Prix unitaire:</Text>
                <Text style={styles.productDetailValue}>
                  {selectedProduct.price.toFixed(2)} DT
                </Text>
              </View>
              
              <View style={styles.productDetailRow}>
                <Text style={styles.productDetailLabel}>Total:</Text>
                <Text style={styles.productDetailValue}>
                  {(selectedProduct.price * selectedProduct.quantity).toFixed(2)} DT
                </Text>
              </View>
              
              {selectedProduct.description && (
                <View style={styles.productDescriptionContainer}>
                  <Text style={styles.productDetailLabel}>Description:</Text>
                  <Text style={styles.productDescription}>{selectedProduct.description}</Text>
                </View>
              )}
            </>
          )}
          
          <TouchableOpacity
            style={styles.closeProductModalButton}
            onPress={() => setProductModalVisible(false)}
          >
            <Text style={styles.closeProductModalText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

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

        <View style={styles.section}>
          <Text style={styles.sectionTitle1}>Expéditeur</Text>
          <View style={styles.contactCard}>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>
                {typeof commande.createdBy === 'string' 
                  ? 'Expéditeur (ID: ' + commande.createdBy + ')' 
                  : commande.createdBy?.name || 'Non spécifié'}
              </Text>
            </View>
            
            {typeof commande.createdBy !== 'string' && commande.createdBy?.phone && (
              <View style={styles.contactActions}>
                <TouchableOpacity 
                  style={styles.iconButton}
                  onPress={() => handleStartConversation(commande.createdBy.id, commande.createdBy.name)}>
                  <MaterialIcons name="message" size={24} color="#44076a" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.iconButton}
                  onPress={() => confirmCall(commande.createdBy.phone, commande.createdBy.name)}>
                  <MaterialIcons name="phone" size={24} color="#44076a" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle1}>Destinataire</Text>
          
          <View style={styles.contactCard}>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{destinataire?.name || 'Non spécifié'}</Text>
            </View>
            
            <View style={styles.contactActions}>
              {destinataire?.uid && (
                <>
                  <TouchableOpacity 
                    style={styles.iconButton}
                    onPress={() => handleStartConversation(destinataire.uid, destinataire.name)}>
                    <MaterialIcons name="message" size={24} color="#44076a" />
                  </TouchableOpacity>
                  
                  {destinataire?.phone && (
                    <TouchableOpacity 
                      style={styles.iconButton}
                      onPress={() => confirmCall(destinataire.phone, destinataire.name)}>
                      <MaterialIcons name="phone" size={24} color="#44076a" />
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          </View>
        </View>

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

          <View style={styles.detailRow}>
            <MaterialIcons name="attach-money" size={20} color="#44076a" />
            <Text style={styles.detailLabel}>Montant total:</Text>
            <Text style={[styles.detailValue, { fontWeight: 'bold' }]}>
              {commande.totalAmount?.toFixed(2) || '0.00'} DT
            </Text>
          </View>

          {/* Section Produits */}
          <View style={styles.productsSection}>
            <Text style={styles.productsTitle}>Produits ({products.length})</Text>
            
            {products.map((product, index) => (
              <TouchableOpacity 
                key={product.id || index}
                style={styles.productItem}
                onPress={() => {
                  setSelectedProduct(product);
                  setProductModalVisible(true);
                }}
              >
                {product.image && (
                  <Image 
                    source={{uri: product.image}} 
                    style={styles.productImageSmall}
                  />
                )}
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {product.name || `Produit ${index + 1}`}
                  </Text>
                  <Text style={styles.productQuantity}>
                    {product.quantity || 1} x {product.price?.toFixed(2) || '0.00'} DT
                  </Text>
                </View>
                <Text style={styles.productTotal}>
                  {((product.price || 0) * (product.quantity || 1)).toFixed(2)} DT
                </Text>
                <MaterialIcons name="chevron-right" size={20} color="#44076a" />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.addressSection}>
            <View style={styles.addressHeader}>
              <MaterialIcons name="location-on" size={20} color="#ac0d8c" />
              <Text style={styles.addressTitle}>Adresse de départ</Text>
            </View>
            <Text style={styles.addressText}>{commande.origin}</Text>
          </View>

          <View style={styles.addressSection}>
            <View style={styles.addressHeader}>
              <MaterialIcons name="location-on" size={20} color="#34A853" />
              <Text style={styles.addressTitle}>Adresse de destination</Text>
            </View>
            <Text style={styles.addressText}>{commande.destination}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Modal de chat */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={chatModalVisible}
        onRequestClose={() => setChatModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Discussion avec {currentChatUser?.name}</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setChatModalVisible(false)}>
              <MaterialIcons name="close" size={24} color="#44076a" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.chatArea}
            ref={chatScrollRef}
            contentContainerStyle={styles.chatContent}>
            {messages.map((msg) => (
              <View key={msg.id} style={[
                styles.messageBubble,
                msg.senderId === firebaseAuth.currentUser?.uid ? styles.myMessage : styles.theirMessage
              ]}>
                <Text style={styles.senderName}>
                  {msg.senderId === firebaseAuth.currentUser?.uid ? 'Moi' : msg.senderName}
                </Text>
                <Text style={styles.messageText}>{msg.text}</Text>
                <Text style={styles.messageTime}>
                  {msg.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
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
              style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
              onPress={handleSendMessage}
              disabled={!newMessage.trim()}>
              <MaterialIcons name="send" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {renderProductModal()}
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
  contactPhone: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
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
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
    borderTopRightRadius: 0,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ECECEC',
    borderTopLeftRadius: 0,
  },
  senderName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#555',
  },
  messageText: {
    fontSize: 16,
  },
  messageTime: {
    fontSize: 10,
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
    padding: 12,
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
  sendButtonDisabled: {
    opacity: 0.5,
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
    marginLeft: 30,
  },
  productsSection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  productsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#44076a',
    marginBottom: 10,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productImageSmall: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 10,
  },
  productInfo: {
    flex: 1,
    marginRight: 10,
  },
  productName: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productQuantity: {
    fontSize: 12,
    color: '#666',
  },
  productTotal: {
    fontWeight: 'bold',
    marginHorizontal: 10,
    color: '#44076a',
  },

  // Styles pour le modal produit
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  productModalView: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  productModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#44076a',
    marginBottom: 15,
    textAlign: 'center',
  },
  productImage: {
    width: '100%',
    height: 200,
    marginBottom: 15,
    borderRadius: 8,
  },
  productDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  productDetailLabel: {
    fontWeight: 'bold',
    color: '#333',
  },
  productDetailValue: {
    color: '#666',
  },
  productDescriptionContainer: {
    marginTop: 15,
  },
  productDescription: {
    color: '#666',
    marginTop: 5,
  },
  closeProductModalButton: {
    marginTop: 20,
    backgroundColor: '#44076a',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
  },
  closeProductModalText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default CommandeDetailsScreen; 