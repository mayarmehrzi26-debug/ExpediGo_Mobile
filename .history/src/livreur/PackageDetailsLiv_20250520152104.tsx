import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { doc, getDoc, updateDoc,import { addDoc, collection, doc, getDoc, getDocs, increment, limit, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, where, writeBatch } from "firebase/firestore";
import { firebasestore } from "../../../FirebaseConfig";

export class LivraisonModel {
  async getClientByUserId(uid: string): Promise<any> {
    try {
      // Try users collection first
      const userQuery = query(
        collection(firebasestore, "users"),
        where("uid", "==", uid)
      );
      const userSnapshot = await getDocs(userQuery);
      
      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data();
        const clientDoc = await getDoc(doc(firebasestore, "clients", userData.clientId));
        return {
          id: clientDoc.id,
          ...clientDoc.data()
        };
      }

      // Try clients collection directly
      const clientsQuery = query(
        collection(firebasestore, "clients"),
        where("uid", "==", uid)
      );
      const clientsSnapshot = await getDocs(clientsQuery);
      
      if (!clientsSnapshot.empty) {
        return {
          id: clientsSnapshot.docs[0].id,
          ...clientsSnapshot.docs[0].data()
        };
      }

      return null;
    } catch (error) {
      console.error("Error getting client:", error);
      return null;
    }
  }
  async getClientById(clientId: string): Promise<any> {
    try {
      const docRef = doc(firebasestore, "clients", clientId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      console.error("Error getting client:", error);
      return null;
    }
  }
  
  async getCommandeById(commandeId: string): Promise<any> {
    try {
      const docRef = doc(firebasestore, "livraisons", commandeId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
  
      const data = docSnap.data();
      const addressDoc = data.address 
        ? await getDoc(doc(firebasestore, "adresses", data.address))
        : null;
  
      // Si createdBy est une string, on la conserve telle quelle
      // Si c'est une référence, on pourrait la résoudre ici
      return {
        id: docSnap.id,
        ...data,
        createdBy: data.createdBy, // Peut être string ou objet
        clientId: data.client,
        originAddress: addressDoc?.exists() ? addressDoc.data().address : "Adresse inconnue",
        createdAt: data.createdAt?.toDate?.() || new Date(),
        assignedTo: data.assignedTo,
        totalAmount: data.totalAmount || data.montant || 0
      };
    } catch (error) {
      console.error("Error getting commande:", error);
      return null;
    }
  }
  async getCommandesWithAdresses(clientId: string): Promise<any[]> {
    try {
      const livraisonsSnapshot = await getDocs(
        query(collection(firebasestore, "livraisons"), where("client", "==", clientId))
      );
  
      const adressesSnapshot = await getDocs(collection(firebasestore, "adresses"));
      const adressesMap = new Map<string, any>(
        adressesSnapshot.docs.map(doc => [doc.id, doc.data()])
      );
  
      return livraisonsSnapshot.docs.map(doc => {
        const data = doc.data();
        const addressId = data.address;
        const addressData = adressesMap.get(addressId) || { address: `Adresse inconnue (ID: ${addressId})` };
  
        return {
          id: doc.id,
          originAddress: addressData.address, // Adresse complète de l'origine
          ...data
        };
      });
  
    } catch (error) {
      console.error("Erreur critique:", error);
      return [];
    }
  }
  async getUserById(userId: string): Promise<any> {
    try {
      const userDoc = await getDoc(doc(firebasestore, "users", userId));
      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  }
  async getProductById(productId: string): Promise<any> {
    try {
      const productDoc = await getDoc(doc(firebasestore, "products", productId));
      return productDoc.exists() ? productDoc.data() : null;
    } catch (error) {
      console.error("Error getting product:", error);
      return null;
    }
  }
  async createConversation(participants: string[]): Promise<string> {
    try {
      // Vérification des participants
      if (!participants || participants.length !== 2) {
        throw new Error("Une conversation nécessite exactement 2 participants");
      }
  
      // Vérification que les utilisateurs existent
      for (const userId of participants) {
        const exists = await this.userExists(userId);
        if (!exists) {
          throw new Error(`L'utilisateur ${userId} n'existe pas`);
        }
      }
  
      const conversationData = {
        participants,
        lastMessage: "",
        lastMessageAt: new Date(),
        createdBy: participants[0],
        createdAt: new Date(),
        status: "active",
        participantNames: {} // Vous pouvez ajouter les noms ici si nécessaire
      };
  
      const docRef = await addDoc(collection(firebasestore, "conversations"), conversationData);
      return docRef.id;
    } catch (error) {
      console.error("Error creating conversation:", error);
      throw error;
    }
  }
  
  async sendMessage(conversationId: string, message: {
    text: string;
    sender: string;
  }): Promise<void> {
    try {
      // Ajouter le message à la sous-collection
      await addDoc(collection(firebasestore, "conversations", conversationId, "messages"), {
        ...message,
        createdAt: new Date(),
        read: false
      });
      
      // Mettre à jour la conversation
      await updateDoc(doc(firebasestore, "conversations", conversationId), {
        lastMessage: message.text,
        lastMessageAt: new Date()
      });
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }
  
  async getConversations(userId: string): Promise<any[]> {
    try {
      const q = query(
        collection(firebasestore, "conversations"),
        where("participants", "array-contains", userId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error getting conversations:", error);
      return [];
    }
  }
  
  async getMessages(conversationId: string): Promise<any[]> {
    try {
      const q = query(
        collection(firebasestore, "conversations", conversationId, "messages"),
        orderBy("createdAt", "desc"),
        limit(50)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error getting messages:", error);
      return [];
    }
  }
  async findExistingConversation(participants: string[]): Promise<string | null> {
    try {
      if (!participants || participants.length !== 2) {
        console.error("Participants invalides");
        return null;
      }
  
      // Vérifiez que les deux participants existent
      const [user1, user2] = participants;
      const user1Exists = await this.userExists(user1);
      const user2Exists = await this.userExists(user2);
  
      if (!user1Exists || !user2Exists) {
        console.error("Un ou plusieurs participants n'existent pas");
        return null;
      }
  
      // Recherchez une conversation existante
      const q = query(
        collection(firebasestore, "conversations"),
        where("participants", "array-contains", user1)
      );
      
      const snapshot = await getDocs(q);
      for (const doc of snapshot.docs) {
        const data = doc.data();
        if (data.participants.includes(user2)) {
          return doc.id;
        }
      }
      return null;
    } catch (error) {
      console.error("Error finding conversation:", error);
      return null;
    }
  }
  
  async userExists(userId: string): Promise<boolean> {
    try {
      const userDoc = await getDoc(doc(firebasestore, "users", userId));
      return userDoc.exists();
    } catch (error) {
      console.error("Error checking user existence:", error);
      return false;
    }
  }
  async incrementClientReturns(clientId: string): Promise<void> {
    try {
      const clientRef = doc(firebasestore, "clients", clientId);
      await updateDoc(clientRef, {
        total_returns: increment(1)
      });
      console.log("Compteur de retours incrémenté pour le client:", clientId);
    } catch (error) {
      console.error("Erreur lors de l'incrémentation du compteur:", error);
      throw error;
    }
  }
  async getDestinataireByCommandeId(commandeId: string): Promise<any> {
    try {
      const commandeDoc = await getDoc(doc(firebasestore, "livraisons", commandeId));
      if (!commandeDoc.exists()) return null;
  
      const commandeData = commandeDoc.data();
      
      // 1. Si le client est une référence
      if (commandeData.client?.path) {
        const clientDoc = await getDoc(doc(firebasestore, commandeData.client.path));
        if (clientDoc.exists()) return { id: clientDoc.id, ...clientDoc.data() };
      }
      
      // 2. Si c'est un ID string (comme dans votre image)
      if (typeof commandeData.client === 'string') {
        // Nettoyer l'ID si nécessaire (enlever les caractères invalides)
        const cleanId = commandeData.client.replace(':', '');
        
        // Chercher dans users avec le rôle "destinataire"
        const userQuery = query(
          collection(firebasestore, "users"),
          where("clientId", "==", cleanId),
          where("role", "==", "destinataire"),
          limit(1)
        );
        
        const querySnapshot = await getDocs(userQuery);
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          return { id: userDoc.id, ...userDoc.data() };
        }
      }
  
      return null;
    } catch (error) {
      console.error("Error getting destinataire:", error);
      return null;
    }
  }
  async checkUserExists(userId: string): Promise<boolean> {
    try {
      // Vérifie d'abord dans la collection users
      const userDoc = await getDoc(doc(firebasestore, "users", userId));
      if (userDoc.exists()) return true;
      
      // Si pas trouvé, vérifie dans la collection clients
      const clientDoc = await getDoc(doc(firebasestore, "clients", userId));
      return clientDoc.exists();
    } catch (error) {
      console.error("Error checking user existence:", error);
      return false;
    }
  }
  async creditExpediteur(expediteurId: string, montant: number, commandeId: string): Promise<void> {
    try {
      console.log(`Tentative de crédit: ${montant}dt pour ${expediteurId} (commande ${commandeId})`);
  
      // Validation renforcée
      if (!expediteurId || typeof expediteurId !== 'string') {
        throw new Error("ID expéditeur invalide");
      }
      
      if (typeof montant !== 'number' || montant <= 0) {
        throw new Error(`Montant invalide: ${montant}`);
      }
  
      if (!commandeId) {
        throw new Error("ID commande requis");
      }
  
      const batch = writeBatch(firebasestore);
      const soldeRef = doc(firebasestore, "soldes", expediteurId);
      const transactionRef = doc(collection(firebasestore, "transactions"));
  
      // Vérification que l'utilisateur existe
      const userExists = await this.checkUserExists(expediteurId);
      if (!userExists) {
        throw new Error(`L'utilisateur ${expediteurId} n'existe pas`);
      }
  
      // Récupération du solde actuel
      const soldeSnap = await getDoc(soldeRef);
      const soldeData = soldeSnap.exists() ? soldeSnap.data() : null;
  
      console.log('Solde actuel:', soldeData);
  
      // Mise à jour du solde
      if (soldeSnap.exists()) {
        batch.update(soldeRef, {
          soldeEnAttente: increment(montant),
          lastUpdated: serverTimestamp()
        });
      } else {
        batch.set(soldeRef, {
          userId: expediteurId,
          soldeDisponible: 0,
          soldeEnAttente: montant,
          lastUpdated: serverTimestamp()
        });
      }
  
      // Création de la transaction
      batch.set(transactionRef, {
        userId: expediteurId,
        commandeId: commandeId,
        amount: montant,
        type: "livraison",
        status: "completed",
        description: `Crédit pour livraison ${commandeId}`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
  
      // Exécution du batch
      await batch.commit();
      console.log('Crédit effectué avec succès');
  
    } catch (error) {
      console.error("Échec du crédit:", error);
      throw new Error(`Échec du crédit: ${error.message}`);
    }
  }
  async updatePaymentStatus(commandeId: string, status: string): Promise<void> {
    try {
      const commandeRef = doc(firebasestore, "livraisons", commandeId);
      await updateDoc(commandeRef, {
        paiement: status,
        paymentUpdatedAt: new Date()
      });
    } catch (error) {
      console.error("Error updating payment status:", error);
      throw error;
    }
  }
  async getSolde(userId: string): Promise<{disponible: number, enAttente: number}> {
    try {
      const soldeDoc = await getDoc(doc(firebasestore, "soldes", userId));
      if (!soldeDoc.exists()) {
        return { disponible: 0, enAttente: 0 };
      }
      const data = soldeDoc.data();
      return {
        disponible: data.soldeDisponible || 0,
        enAttente: data.soldeEnAttente || 0
      };
    } catch (error) {
      console.error("Error getting solde:", error);
      return { disponible: 0, enAttente: 0 };
    }
  }
  
  async transfererSoldeEnAttente(userId: string): Promise<void> {
    try {
      const soldeRef = doc(firebasestore, "soldes", userId);
      const soldeDoc = await getDoc(soldeRef);
      
      if (!soldeDoc.exists()) {
        throw new Error("Aucun solde trouvé pour cet utilisateur");
      }
  
      const data = soldeDoc.data();
      const soldeEnAttente = data.soldeEnAttente || 0;
  
      if (soldeEnAttente <= 0) {
        throw new Error("Aucun solde en attente à transférer");
      }
  
      await updateDoc(soldeRef, {
        soldeDisponible: increment(soldeEnAttente),
        soldeEnAttente: 0,
        lastUpdated: serverTimestamp()
      });
  
    } catch (error) {
      console.error("Error transferring solde:", error);
      throw error;
    }
  }
  async updateLivreurPosition(livreurId: string, position: {
    latitude: number;
    longitude: number;
    commandeId?: string;
    status?: string;
  }): Promise<void> {
    try {
      const livreurLocationRef = doc(firebasestore, "livreurLocations", livreurId);
      await updateDoc(livreurLocationRef, {
        ...position,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la position du livreur:", error);
      throw error;
    }
  }
  async getLivreurPosition(livreurId: string): Promise<{
    latitude: number;
    longitude: number;
    timestamp: Date;
    commandeId?: string;
    status?: string;
  } | null> {
    try {
      const livreurLocationRef = doc(firebasestore, "livreurLocations", livreurId);
      const docSnap = await getDoc(livreurLocationRef);
      
      if (!docSnap.exists()) return null;
      
      const data = docSnap.data();
      return {
        latitude: data.latitude,
        longitude: data.longitude,
        timestamp: data.timestamp?.toDate() || new Date(),
        commandeId: data.commandeId,
        status: data.status
      };
    } catch (error) {
      console.error("Erreur lors de la récupération de la position du livreur:", error);
      return null;
    }
  }
  listenToLivreurPosition(
    livreurId: string,
    callback: (position: {
      latitude: number;
      longitude: number;
      timestamp: Date;
      commandeId?: string;
      status?: string;
    } | null) => void
  ): () => void {
    const livreurLocationRef = doc(firebasestore, "livreurLocations", livreurId);
    
    // Créer le document avec des valeurs par défaut s'il n'existe pas
    setDoc(livreurLocationRef, {
      latitude: 0,
      longitude: 0,
      status: 'inactive',
      timestamp: serverTimestamp()
    }, { merge: true }).catch(error => {
      console.error("Erreur lors de la création du document livreur:", error);
    });
  
    const unsubscribe = onSnapshot(livreurLocationRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        console.log("Position du livreur reçue:", data);
        callback({
          latitude: data.latitude,
          longitude: data.longitude,
          timestamp: data.timestamp?.toDate() || new Date(),
          commandeId: data.commandeId,
          status: data.status
        });
      } else {
        console.log("Document non trouvé, tentative de recréation...");
        // Tentative de recréation du document
        setDoc(livreurLocationRef, {
          latitude: 0,
          longitude: 0,
          status: 'inactive',
          timestamp: serverTimestamp()
        }, { merge: true }).then(() => {
          console.log("Document recréé avec succès");
        }).catch(error => {
          console.error("Échec de la recréation du document:", error);
        });
        callback(null);
      }
    });
  
    return unsubscribe;
  }
  async updateOrCreateLivreurPosition(
    livreurId: string, 
    position: {
      latitude: number;
      longitude: number;
      commandeId?: string;
      status?: string;
      livreurName?: string;
      assignedTo?: string;
    }
  ): Promise<void> {
    try {
      const livreurLocationRef = doc(firebasestore, "livreurLocations", livreurId);
      
      await setDoc(livreurLocationRef, {
        ...position,
        timestamp: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        assignedTo: livreurId // S'assurer que l'ID du livreur est bien enregistré
      }, { merge: true });
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la position:", error);
      throw error;
    }
  }
  
}  } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import MapView, { Marker, Polyline, UrlTile } from "react-native-maps";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { firebasestore } from "../../FirebaseConfig";
import Statusbagde from "../../src/components/StatusBadge";

const LOCATION_TASK_NAME = "background-location-task";

// Définition de la tâche de suivi en arrière-plan
TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
  if (error) {
    console.error("Background location error:", error);
    return;
  }
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    const location = locations[0];
    if (location) {
      console.log("Background location update:", location);
    }
  }
});

interface PackageDetailsRouteParams {
  scannedData: string;
}

interface PackageDetailsProps {
  route: { params: PackageDetailsRouteParams };
  navigation: any;
}

interface Delivery {
  id: string;
  address: string;
  destination: string;
  montant: string;
  client: string;
  product: string;
  payment: string;
  isExchange: boolean;
  isFragile: boolean;
  status: string;
  createdAt: Date;
}

interface PackageDetails {
  deliveryId: string;
  address: string;
  client: string;
  product: string;
  destination: string;
  montant: string;
  payment: string;
  isExchange: boolean;
  isFragile: boolean;
  status: string;
  createdAt: Date;
}

const PackageDetailsLiv: React.FC<PackageDetailsProps> = ({
  route,
  navigation,
}) => {
  const { scannedData } = route.params;
  const [packageDetails, setPackageDetails] = useState<PackageDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [routeCoords, setRouteCoords] = useState<
    { latitude: number; longitude: number }[]
  >([]);
  const [distanceRemaining, setDistanceRemaining] = useState<number | null>(null);
  const [isConfirmationModalVisible, setConfirmationModalVisible] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [locationSubscription, setLocationSubscription] = 
    useState<Location.LocationSubscription | null>(null);
  const [isStartingTracking, setIsStartingTracking] = useState(false);

  const startBackgroundTracking = async () => {
    try {
      // Demander les permissions si nécessaire
      const { status } = await Location.requestBackgroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error("Permission de localisation en arrière-plan non accordée");
      }
  
      // Vérifier si le service de localisation est déjà actif
      const isActive = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
      if (isActive) {
        return true;
      }
  
      // Démarrer le suivi en arrière-plan
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.High,
        distanceInterval: 50, // Mettre à jour toutes les 50 mètres
        timeInterval: 5000, // Mettre à jour toutes les 5 secondes
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: `Livraison en cours #${scannedData}`,
          notificationBody: "Vous êtes en route vers la destination",
          notificationColor: "#877DAB",
        },
        pausesUpdatesAutomatically: false,
      });
  
      return true;
    } catch (error) {
      console.error("Échec du démarrage du suivi:", error);
      throw error;
    }
  };

  const startTrackingWithRetry = async (attempts = 0): Promise<boolean> => {
    try {
      setIsStartingTracking(true);
      const result = await startBackgroundTracking();
      return result;
    } catch (error) {
      if (attempts < 2 && error.message.includes('foreground service')) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return startTrackingWithRetry(attempts + 1);
      }
      throw error;
    } finally {
      setIsStartingTracking(false);
    }
  };

  const stopBackgroundTracking = async () => {
    try {
      const hasStarted = await Location.hasStartedLocationUpdatesAsync(
        LOCATION_TASK_NAME
      );
      if (hasStarted) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      }
    } catch (error) {
      console.log("Le suivi était déjà arrêté");
    }
  };

  useEffect(() => {
    const fetchPackageDetails = async () => {
      if (!scannedData) {
        console.error("Aucun code de suivi fourni.");
        setLoading(false);
        return;
      }

      try {
        const deliveryDoc = await getDoc(
          doc(firebasestore, "livraisons", scannedData)
        );
        if (deliveryDoc.exists()) {
          const deliveryData = deliveryDoc.data() as Delivery;

          const [clientDoc, destinationDoc, productDoc, addressDoc] = await Promise.all([
            getDoc(doc(firebasestore, "clients", deliveryData.client)),
            getDoc(doc(firebasestore, "clients", deliveryData.client)),
            getDoc(doc(firebasestore, "products", deliveryData.product)),
            getDoc(doc(firebasestore, "adresses", deliveryData.address))
          ]);

          const mergedData: PackageDetails = {
            deliveryId: deliveryData.id,
            address: addressDoc.exists() ? addressDoc.data()?.address : "Adresse inconnue",
            client: clientDoc.exists() ? clientDoc.data()?.name : "Client inconnu",
            product: productDoc.exists() ? productDoc.data()?.name : "Produit inconnu",
            destination: destinationDoc.exists() ? destinationDoc.data()?.address : "Adresse inconnue",
            payment: deliveryData.payment,
            isExchange: deliveryData.isExchange,
            isFragile: deliveryData.isFragile,
            status: deliveryData.status,
            createdAt: deliveryData.createdAt.toDate(),
            montant: deliveryData.totalAmount,
          };

          setPackageDetails(mergedData);

          const destCoords = await Location.geocodeAsync(mergedData.destination);
          if (destCoords.length > 0) {
            setDestinationCoords({
              latitude: destCoords[0].latitude,
              longitude: destCoords[0].longitude,
            });
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des détails:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackageDetails();
  }, [scannedData]);

  useEffect(() => {
    const initLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const bgStatus = await Location.requestBackgroundPermissionsAsync();
      if (bgStatus.status !== "granted") {
        Alert.alert(
          "Permission requise",
          "Autorisez l'accès à la localisation en arrière-plan",
          [
            { text: "Annuler", style: "cancel" },
            { text: "Paramètres", onPress: () => Linking.openSettings() }
          ]
        );
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    };

    initLocation();
  }, []);

  useEffect(() => {
    if (location && destinationCoords) {
      fetchRoute(location.coords, destinationCoords);
    }
  }, [location, destinationCoords]);

  useEffect(() => {
    return () => {
      locationSubscription?.remove();
      stopBackgroundTracking();
    };
  }, [locationSubscription]);
  const fetchRoute = async (
    start: Location.LocationObject['coords'],
    end: { latitude: number; longitude: number }
  ) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`
      );
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const coordinates = data.routes[0].geometry.coordinates.map(
          (coord: [number, number]) => ({
            latitude: coord[1],
            longitude: coord[0],
          })
        );
        setRouteCoords(coordinates);
        setDistanceRemaining(data.routes[0].distance / 1000);
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };
  const handleStartDelivery = () => {
    setConfirmationModalVisible(true);
  };

  const confirmDelivery = async () => {
    setConfirmationModalVisible(false);
    
    try {
      if (packageDetails?.status === "En cours de livraison") {
        locationSubscription?.remove();
        await stopBackgroundTracking();
        setIsTracking(false);

        await updateDoc(doc(firebasestore, "livraisons", scannedData), {
          status: "Livré",
        });

        Alert.alert("Succès", "Livraison terminée!");
      } else {
        const trackingStarted = await startTrackingWithRetry();
        if (!trackingStarted) return;

        const subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000,
            distanceInterval: 10,
          },
          (newLocation) => {
            setLocation(newLocation);
            if (destinationCoords) {
              fetchRoute(newLocation.coords, destinationCoords);
            }
          }
        );

        setLocationSubscription(subscription);
        setIsTracking(true);

        await updateDoc(doc(firebasestore, "livraisons", scannedData), {
          status: "En cours de livraison",
        });
      }

      setPackageDetails(prev => prev ? {
        ...prev,
        status: prev.status === "En cours de livraison" ? "Livré" : "En cours de livraison"
      } : null);
    } catch (error) {
      Alert.alert(
        "Erreur", 
        error.message.includes('foreground service')
          ? "Veuillez garder l'application ouverte pour démarrer le suivi"
          : "Une erreur est survenue"
      );
    }
  };

  const cancelDelivery = () => {
    setConfirmationModalVisible(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9C27B0" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location?.coords.latitude || 36.8065,
            longitude: location?.coords.longitude || 10.1815,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <UrlTile
            urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={19}
          />
          {location && (
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="Votre position"
            />
          )}
          {destinationCoords && (
            <Marker coordinate={destinationCoords} title="Destination" />
          )}
          {routeCoords.length > 0 && (
            <Polyline
              coordinates={routeCoords}
              strokeWidth={4}
              strokeColor="#0076C7"
            />
          )}
        </MapView>
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      <ScrollView style={styles.contentScrollView}>
        {/* Section Contact Destinataire */}
<View style={styles.contactContainer}>
  <Text style={styles.contactLabel}>Destinataire:</Text>
  <View style={styles.contactRow}>
    <Text style={styles.contactName}>{packageDetails?.client}</Text>
    <View style={styles.contactIcons}>
      <TouchableOpacity style={styles.contactIconButton}>
        <Ionicons name="call" size={25} color="#877DAB" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.contactIconButton}>
        <Ionicons name="chatbox" size={25} color="#877DAB" />
      </TouchableOpacity>
    </View>
  </View>
</View>
        {/* Section Contact Expéditeur */}

<View style={styles.contactContainer}>
  <Text style={styles.contactLabel}>Expéditeur:</Text>
  <View style={styles.contactRow}>
    <Text style={styles.contactName}>{packageDetails?.client}</Text>
    <View style={styles.contactIcons}>
      <TouchableOpacity style={styles.contactIconButton}>
        <Ionicons name="call" size={25} color="#877DAB" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.contactIconButton}>
        <Ionicons name="chatbox" size={25} color="#877DAB" />
      </TouchableOpacity>
    </View>
  </View>
</View>
{packageDetails?.status !== "Livré" && (
                <TouchableOpacity
                  style={[
                    styles.startDeliveryButton,
                    packageDetails?.status === "En cours de livraison" && {
                      backgroundColor: "#877DAB",
                    },
                    isStartingTracking && { opacity: 0.7 },
                  ]}
                  onPress={handleStartDelivery}
                  disabled={isStartingTracking}
                >
                  {isStartingTracking ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Text style={styles.startDeliveryButtonText}>
                        {packageDetails?.status === "En cours de livraison"
                          ? "Terminer la livraison"
                          : "Commencez à livrer"}
                      </Text>
                      {packageDetails?.status === "En cours de livraison" && (
                        <Text style={styles.trackingStatusText}>Suivi en cours...</Text>
                      )}
                    </>
                  )}
                </TouchableOpacity>
              )}
        <View style={styles.card}>
          {packageDetails ? (
            <>
              <View style={styles.cardHeader}>
                <Text style={styles.productName}>
                  Commande #{packageDetails.deliveryId}
                </Text>
                <Statusbagde status={packageDetails.status} />
              </View>

              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionText}>
                  Colis de <Text style={styles.boldText}>{packageDetails.address}</Text> à{" "}
                  <Text style={styles.boldText}>{packageDetails.destination}</Text> pour{" "}
                  <Text style={styles.boldText}>{packageDetails.client}</Text>
                </Text>
              </View>

              <View style={styles.infoBadgesContainer}>
                <View style={styles.infoBadge}>
                  <Icon name="credit-card" size={16} color="#F06292" />
                  <Text style={styles.infoBadgeText}>{packageDetails.payment}</Text>
                </View>
                <View style={styles.infoBadge}>
                  <Icon name="calendar" size={16} color="#9C27B0" />
                  <Text style={styles.infoBadgeText}>
                    {new Date(packageDetails.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <View style={styles.detailLabelContainer}>
                    <Icon name="package-variant" size={16} color="#9C27B0" />
                    <Text style={styles.detailLabel}> Produit:</Text>
                  </View>
                  <Text style={styles.detailValue}>{packageDetails.product}</Text>
                </View>
              </View>

              <View style={styles.priceQuantityContainer}>
                <View>
                  <Text style={styles.priceLabel}>Montant total :</Text>
                  <Text style={styles.priceValue}>{packageDetails.montant} dt</Text>
                </View>
              </View>

            
            </>
          ) : (
            <Text style={styles.noDeliveriesText}>
              Aucun détail trouvé pour cette livraison.
            </Text>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={isConfirmationModalVisible}
        transparent
        animationType="slide"
        onRequestClose={cancelDelivery}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              {packageDetails?.status === "En cours de livraison"
                ? "Terminer la livraison maintenant ?"
                : "Démarrer le suivi de livraison maintenant ?"}
            </Text>
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmDelivery}
              >
                <Text style={styles.modalButtonText}>Oui</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={cancelDelivery}
              >
                <Text style={styles.modalButtonText}>Non</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  mapContainer: {
    height: 300,
    width: "100%",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 10,
    borderRadius: 20,
  },
  contentScrollView: {
    flex: 1,
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: "#F7F7F7",
    paddingTop: 30,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    margin: 15,
    marginTop: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    flex: 1,
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  descriptionText: {
    fontSize: 14,
    color: "#666666",
  },
  boldText: {
    fontWeight: "bold",
    color: "#333333",
  },
  infoBadgesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 14,
  },
  infoBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 6,
    marginBottom: 8,
  },
  infoBadgeText: {
    fontSize: 14,
    color: "#333333",
    marginLeft: 8,
  },
  detailsContainer: {
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  detailLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 14,
    color: "#666666",
  },
  detailValue: {
    fontSize: 14,
    color: "#333333",
    fontWeight: "500",
  },
  priceQuantityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  priceLabel: {
    fontSize: 14,
    color: "#666666",
  },
  priceValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
  },
  noDeliveriesText: {
    fontSize: 16,
    color: "#A7A9B7",
    textAlign: "center",
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#877DAB",
  },
  startDeliveryButton: {
    backgroundColor: "#F06292",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 5,
    marginHorizontal:60
  },
  startDeliveryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  trackingStatusText: {
    color: "white",
    fontSize: 12,
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "80%",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginHorizontal: 5,
  },
  confirmButton: {
    backgroundColor: "#877DAB",
  },
  cancelButton: {
    backgroundColor: "#F06292",
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  contactContainer: {
    marginBottom: 10,
    borderRadius: 20,

    borderBottomWidth: 1,
    borderColor: '#EDEDED',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal:22,
    backgroundColor: "#fff",

  },
  contactLabel: {
    fontSize: 14,
    color: '#666666',
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  contactIcons: {
    flexDirection: 'row',
  },
  contactIconButton: {
    marginLeft: 10,
    padding: 8,
  },
});

export default PackageDetailsLiv;
