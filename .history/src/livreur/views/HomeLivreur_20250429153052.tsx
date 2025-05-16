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
  View,
} from 'react-native';

import { RootStackParamList } from '../../../NavigationTypes';
import BarcodeScanner from '../../../screens/BarcodeScanner';
import CardCommande  from '../components/CardCommande';
import NavBottomLiv from "../../../src/components/shared/NavBottomLiv";
import { fetchCommandes, updateCommandeStatus } from '../services/commandeService';

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

  // Demande permission caméra
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
    const data = await fetchCommandes();
    setCommandes(data);
  };

  // Rechargement automatique à chaque retour sur l'écran
  useFocusEffect(
    React.useCallback(() => {
      loadCommandes();
    }, [])
  );

  return (
    <View style={styles.container}>
      {cameraVisible ? (
        <BarcodeScanner onClose={toggleCamera} />
      ) : (
        <>
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
                style={{ marginLeft: 120 }}
              />
            </TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color="#F7F7F7" />
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Animated.Text style={[styles.animatedText, { opacity: fadeAnim }]}>
              Nouvelles commandes
            </Animated.Text>

            {commandes.map((commande) => (
              <View key={commande.id} style={styles.commandeCard}>
                <CardCommande  commande={commande} />
                <TouchableOpacity
                  onPress={async () => {
                    await updateCommandeStatus(commande.id, commande.type);
                    loadCommandes();
                  }}
                  style={styles.livrerButton}
                >
                  <Text style={styles.livrerText}>Je livre</Text>
                </TouchableOpacity>
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
    paddingTop: 20,
  },
  scrollContent: {
    flexGrow: 1,
    borderTopRightRadius: 53,
    borderTopLeftRadius: 53,
    backgroundColor: "#F7F7F7",
    paddingBottom: 90,
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
});

export default HomeLivreur;
