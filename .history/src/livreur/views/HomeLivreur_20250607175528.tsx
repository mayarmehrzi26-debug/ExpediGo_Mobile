import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Camera } from 'expo-camera';
import React, { useEffect, useRef, useState } from 'react';
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
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { firebaseAuth } from '../../../FirebaseConfig';
import { RootStackParamList } from '../../../NavigationTypes';
import BarcodeScanner from '../../../screens/BarcodeScanner';
import NavBottomLiv from "../../../src/components/shared/NavBottomLiv";
import CardCommande from '../components/CardCommande';
import CardEmballage from '../components/CardEmballage'; // Ajoutez cette importation
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
 const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const toggleCamera = () => {
    setCameraVisible(!cameraVisible);
  };

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
          // Masquer le statut pour HomeLivreur
          showStatus: false
        })));
      }
    } catch (error) {
      console.error("Erreur lors du chargement des commandes:", error);
    }
  };
  useFocusEffect(
    React.useCallback(() => {
      loadCommandes();
    }, [selectedType])
  );
 useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      
      if (user) {
        console.log('Utilisateur connecté:', user.uid);
        // Enregistrer le token FCM pour cet utilisateur
        registerForPushNotificationsAsync(user.uid);
      } else {
        console.log('Aucun utilisateur connecté');
        // Rediriger vers l'écran de connexion si nécessaire
        // navigation.navigate('Login');
      }
    });

    return unsubscribe; // Nettoyer l'abonnement
  }, []);
  return (
    <View style={styles.container}>
      {cameraVisible ? (
        <BarcodeScanner onClose={toggleCamera} />
      ) : (
        <>
          {/* --- Header fixe --- */}
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
            <Ionicons name="notifications-outline" size={24} color="#F7F7F7" />
          </View>
  
          {/* --- Titre et Filtres (fixes aussi) --- */}
          <View style={styles.fixedTopSection}>
            <Animated.Text style={[styles.animatedText, { opacity: fadeAnim }]}>
              Nouvelles commandes
            </Animated.Text>
  
            <View style={styles.filterContainer}>
              <TouchableOpacity
                style={[styles.filterButton, selectedType === 'livraison' && styles.activeButton]}
                onPress={() => setSelectedType('livraison')}
              >
                <Text style={styles.filterText}>Livraison</Text>
              </TouchableOpacity>
  
              <TouchableOpacity
                style={[styles.filterButton, selectedType === 'emballage' && styles.activeButton]}
                onPress={() => setSelectedType('emballage')}
              >
                <Text style={styles.filterText}>Emballage</Text>
              </TouchableOpacity>
            </View>
          </View>
  
          {/* --- Liste scrollable --- */}
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {commandes.map((commande) => (
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
            ))}
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
  livrerButton: {
    backgroundColor: '#877DAB',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  livrerText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
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
});

export default HomeLivreur;