import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import { Camera } from 'expo-camera';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { firebasestore } from '../../FirebaseConfig';
import { RootStackParamList } from '../../NavigationTypes';
import NavBottomLiv from "../../src/components/shared/NavBottomLiv";
import BarcodeScanner from '../BarcodeScanner';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'HomeClient'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const HomeClient: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [trackingCode, setTrackingCode] = useState('');
  const [cameraVisible, setCameraVisible] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

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

  const toggleCamera = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status === 'granted') {
      setCameraVisible(true);
    } else {
      alert("Permission pour accéder à la caméra refusée.");
    }
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
        navigation.navigate('PackageDetails', { scannedData: trackingCode });
      } else {
        alert("Aucune commande trouvée avec ce code de suivi.");
      }
    } catch (error) {
      console.error("Erreur lors de la recherche de la commande : ", error);
      alert("Une erreur s'est produite lors de la recherche de la commande.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingView}
    >
      <View style={styles.content}>
        {cameraVisible ? (
          <View style={styles.fullScreenCamera}>
            <BarcodeScanner onClose={() => setCameraVisible(false)} />
          </View>
        ) : (
          <View style={styles.container}>
            <View style={styles.headerContainer}>
              <Image
                source={require('../../assets/expedigo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Ionicons 
                name="notifications-outline" 
                size={24} 
                color="#F7F7F7" 
                style={styles.notificationIcon} 
              />
            </View>
            
            <Text style={styles.scannerTitle}>Scanner code QR</Text>

            <View style={styles.scanner}>
              <TouchableOpacity onPress={toggleCamera}>
                <MaterialIcons
                  name="qr-code-scanner"
                  size={150}
                  color="#27251F"
                />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.orText}>OR</Text>
            
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Entrez le numéro de commande..."
                placeholderTextColor="#A7A9B7"
                value={trackingCode}
                onChangeText={setTrackingCode}
                returnKeyType="search"
                onSubmitEditing={searchOrderByTrackingCode}
              />
              <TouchableOpacity 
                style={styles.searchButton} 
                onPress={searchOrderByTrackingCode}
              >
                <Ionicons name="search" size={20} color="#A7A9B7" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.packageImageContainer}>
              <Image 
                source={require("../../assets/img.png")}
                style={styles.packageImage} 
                resizeMode="contain"
              />
            </View>
          </View>
        )}
        
        {!cameraVisible && <NavBottomLiv />}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: "#ffff",
  },
  container: {
    flex: 1,
    backgroundColor: "#877DAB",
    borderBottomLeftRadius: 42,
    borderBottomRightRadius: 42,
    paddingBottom: 90, // Espace pour le NavBottom
  },
  fullScreenCamera: {
    flex: 1,
    backgroundColor: 'black',
  },
  logo: {
    width: 125,
    height: 60,
    marginLeft: 20,
    marginTop: Z0,
  },
  notificationIcon: {
    marginLeft: 'auto',
    marginRight: 20,
    marginTop: 26
  },
  scannerTitle: {
    marginTop: 32,
    fontSize: 30,
    color: '#27251F',
    textAlign: 'center',
    fontWeight: "bold",
  },
  scanner: {
    alignItems: "center",
    paddingTop: 40,
  },
  orText: {
    color: "#fff",
    alignSelf: "center",
    paddingTop: 30,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 35,
    paddingHorizontal: 18,
    marginHorizontal: 60,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    marginTop: 30,
  },
  searchInput: {
    flex: 1,
    fontSize: 11,
    color: "#27251F",
    paddingVertical: 12,
  },
  searchButton: {
    padding: 8,
  },
  packageImageContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  packageImage: {
    width: 330,
    height: 280,
  },
});

export default HomeClient;