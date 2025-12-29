import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Camera } from 'expo-camera';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { RootStackParamList } from '../../../NavigationTypes';
import BarcodeScanner from '../../../screens/BarcodeScanner';
import NavBottomLiv from "../../../src/components/shared/NavBottomLiv";
import { auth, firebasestore } from '../../../FirebaseConfig';
import { registerForPushNotificationsAsync } from '../../services/notificationService';
import CardCommande from '../components/CardCommande';
import CardEmballage from '../components/CardEmballage';
import { fetchLivraisons } from '../services/commandeService';
import { fetchEmballages } from '../services/EmballageService';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'HomeLivreur'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const HomeLivreur: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isAddMode, setIsAddMode] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraVisible, setCameraVisible] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0.3)).current;
  const [commandes, setCommandes] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<'livraison' | 'emballage'>('livraison');
  const [userId, setUserId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);

  // Gérer l'état d'authentification et enregistrer le token FCM
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        // Enregistrer le token FCM pour l'utilisateur connecté
        registerForPushNotificationsAsync(user.uid);
        // Charger les notifications
        loadNotifications();
      } else {
        setUserId(null);
      }
    });
    return unsubscribe;
  }, []);

  // Charger les notifications de l'utilisateur
  const loadNotifications = async () => {
    if (!userId) return;
    
    try {
      const userDoc = await getDoc(doc(firebasestore, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setNotifications(userData.notifications || []);
        setNotificationCount(userData.unreadNotificationCount || 0);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des notifications:", error);
    }
  };

  // Animation du bouton
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Animation du texte
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Demander la permission pour la caméra
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const toggleCamera = () => {
    setCameraVisible(!cameraVisible);
  };

  // Charger les commandes ou emballages
  const loadCommandes = async () => {
    try {
      if (selectedType === 'livraison') {
        const livraisons = await fetchLivraisons();
        setCommandes(livraisons.map(l => ({ ...l, type: 'livraison' })));
      } else {
        const emballages = await fetchEmballages();
        setCommandes(emballages.map(e => ({ 
          ...e, 
          type: 'emballage',
          date: e.formattedDate || e.timestamp?.toDate().toLocaleString(),
          showStatus: false
        })));
      }
    } catch (error) {
      console.error("Erreur lors du chargement des commandes:", error);
    }
  };

  // Recharger les données lorsque l'écran est focus ou que le type change
  useFocusEffect(
    useCallback(() => {
      loadCommandes();
      if (userId) loadNotifications();
    }, [selectedType, userId])
  );

  return (
    <View style={styles.container}>
      {cameraVisible ? (
        <BarcodeScanner onClose={toggleCamera} />
      ) : (
        <>
          {/* Header fixe */}
          <View style={styles.headerContainer}>
            <Image
              source={require('../../../assets/expedigo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <TouchableOpacity onPress={toggleCamera}>
              <MaterialIcons
                name="qr-code-scanner"
                size={24}
                color="#F7F7F7"
                style={{ marginLeft: 200 }}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
              <View style={styles.notificationIconContainer}>
                <Ionicons name="notifications-outline" size={24} color="#F7F7F7" />
                {notificationCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Section fixe avec titre et filtres */}
          <View style={styles.fixedTopSection}>
            <Animated.Text style={[styles.animatedText, { opacity: fadeAnim }]}>
              Nouvelles commandes
            </Animated.Text>

            <View style={styles.filterContainer}>
              <TouchableOpacity
                style={[
                  styles.filterButton, 
                  selectedType === 'livraison' && styles.activeButton
                ]}
                onPress={() => setSelectedType('livraison')}
              >
                <Text style={styles.filterText}>Livraison</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterButton, 
                  selectedType === 'emballage' && styles.activeButton
                ]}
                onPress={() => setSelectedType('emballage')}
              >
                <Text style={styles.filterText}>Emballage</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Liste scrollable des commandes */}
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {commandes.length > 0 ? (
              commandes.map((commande) => (
                <View key={commande.id} style={styles.commandeCard}>
                  {commande.type === 'livraison' ? (
                    <CardCommande
                      commande={commande}
                      onRefresh={loadCommandes}
                    />
                  ) : (
                    <CardEmballage
                      emballage={commande}
                      onRefresh={loadCommandes}
                    />
                  )}
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  Aucune {selectedType === 'livraison' ? 'livraison' : 'emballage'} disponible
                </Text>
              </View>
            )}
          </ScrollView>

          <NavBottomLiv />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#877DAB",
    paddingTop: 8,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: "#F7F7F7",
    paddingBottom: 20,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 40,
  },
  logo: {
    width: 130,
    height: 60,
  },
  fixedTopSection: {
    backgroundColor: '#F7F7F7',
    borderTopRightRadius: 53,
    borderTopLeftRadius: 53,
    paddingBottom: 8,
  },
  animatedText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#877DAB',
    textAlign: 'center',
    marginTop: 32,
  },
  commandeCard: {
    marginHorizontal: 16,
    marginTop: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 10,
    backgroundColor: '#E0D6FF',
  },
  activeButton: {
    backgroundColor: '#877DAB',
  },
  filterText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  notificationIconContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    right: -6,
    top: -6,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default HomeLivreur;