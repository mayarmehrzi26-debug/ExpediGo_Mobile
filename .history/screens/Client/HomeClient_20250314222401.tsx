import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import { Camera } from 'expo-camera';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { doc, getDoc } from 'firebase/firestore'; // Import Firestore functions
import { firebasestore } from '../../FirebaseConfig'; // Adjust the path according to your structure
import { RootStackParamList } from '../../NavigationTypes'; // Adjust the path according to your structure
import NavBottomClient from '../../src/components/NavBottomClient';
import BarcodeScanner from '../BarcodeScanner'; // Adjust the path according to your structure

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'HomeLivreur'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const HomeClient: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [trackingCode, setTrackingCode] = useState('');
  const [cameraVisible, setCameraVisible] = useState(false);
  
  // Animation states
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  // Animation effects
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

  // Request camera permission
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setCameraVisible(status === 'granted');
    })();
  }, []);

  const toggleCamera = () => {
    setCameraVisible(!cameraVisible);
  };

  const searchOrderByTrackingCode = async () => {
    if (!trackingCode) {
      alert("Veuillez entrer un code de suivi.");
      return;
    }

    try {
      const orderRef = doc(firebasestore, "livraisons", trackingCode);
      const orderDoc = await getDoc(orderRef);

      if (orderDoc.exists()) {
        const orderData = orderDoc.data();
        alert(`Commande trouvée: ${orderData.id}`); // Update as needed
      } else {
        alert("Aucune commande trouvée avec ce code de suivi.");
      }
    } catch (error) {
      console.error("Erreur lors de la recherche de la commande : ", error);
      alert("Une erreur s'est produite lors de la recherche de la commande.");
    }
  };

  return (
    <View style={styles.container}>
      {cameraVisible ? (
        <BarcodeScanner onClose={toggleCamera} />
      ) : (
        <>
          <View style={styles.headerContainer}>
            <Image
              source={require('../../assets/logo2.png')}
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
            <Ionicons name="notifications-outline" size={24} color="#F7F7F7" style={{ marginRight: 10 }} />
          </View>
          <View style={styles.packageImageContainer}>
            <Image
              source={require("../../assets/parcel.png")}
              style={styles.packageImage}
              resizeMode="contain"
            />
          </View>
          <ScrollView>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Entrez le code de suivi..."
                placeholderTextColor="#A7A9B7"
                value={trackingCode}
                onChangeText={setTrackingCode}
                autoCapitalize="none" // Prevents auto-capitalization
                autoCorrect={false} // Prevents auto-correction
              />
              <TouchableOpacity style={styles.searchButton} onPress={searchOrderByTrackingCode}>
                <Ionicons name="search" size={20} color="#A7A9B7" />
              </TouchableOpacity>
            </View>
          </ScrollView>
          <NavBottomClient />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#44076a",
    paddingTop: 50,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 80,
    paddingLeft: 10,
  },
  logo: {
    width: 130,
    height: 60,
  },
  packageImage: {
    width: 490,
    height: 390,
  },
  packageImageContainer: {
    alignItems: 'center',
    marginTop: -120,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 35,
    paddingHorizontal: 15,
    marginHorizontal: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#27251F",
  },
  searchButton: {},
});

export default HomeClient;