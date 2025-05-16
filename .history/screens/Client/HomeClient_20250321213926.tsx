import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import { Camera } from 'expo-camera';
import { doc, getDoc } from 'firebase/firestore'; // Import Firestore functions
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

import { firebasestore } from '../../FirebaseConfig'; // Adjust the path according to your structure
import { RootStackParamList } from '../../NavigationTypes'; // Adjust the path according to your structure
import BarcodeScanner from '../BarcodeScanner'; // Adjust the path according to your structure

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'HomeClient'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const HomeClient: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [trackingCode, setTrackingCode] = useState('');
  const [cameraVisible, setCameraVisible] = useState(false);
  
  // Animation states
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

  // Request camera permission when the scanner button is pressed
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
        // Navigate to PackageDetails with the scanned tracking code
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
    <View style={styles.content}>

    <View style={styles.container}>
      {cameraVisible ? (
        <BarcodeScanner onClose={() => setCameraVisible(false)} />
      ) : (
        <>
          <View style={styles.headerContainer}>
            <Ionicons name="notifications-outline" size={24} color="#F7F7F7" style={{ marginRight: 10 }} />
          </View>
          <View style={styles.headerContainer}>
          <TouchableOpacity onPress={toggleCamera}>
              <MaterialIcons
                name="qr-code-scanner"
                size={24}
                color="#F7F7F7"
                style={{ marginRight: 120 }}
              />
            </TouchableOpacity>
            </View>
          <View style={styles.searchContainer}>
            
            <TextInput
              style={styles.searchInput}
              placeholder="Entrez le numéro de commande..."
              placeholderTextColor="#A7A9B7"
              value={trackingCode}
              onChangeText={setTrackingCode}
            />
            
            <TouchableOpacity style={styles.searchButton} onPress={searchOrderByTrackingCode}>
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
          <ScrollView>
            
           
            
          </ScrollView>
        </>
      )}
    </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#877DAB",
    borderBottomLeftRadius:32,
    borderBottomRightRadius:32

  },
  content: {
    flex: 1,
    backgroundColor: "#ffff",
    paddingBottom: 200,
  },
  headerContainer: {
    alignItems: "flex-end",
    paddingRight: 10,
  paddingTop:32
  },
 
  packageImage: {
    width: 260,
    height: 260,
  },
  packageImageContainer: {
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 35,
    paddingHorizontal: 8,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    marginTop: 240,
    marginRight:60,
    marginLeft:60

  },
  searchInput: {
    flex: 1,
    fontSize: 11,
    color: "#27251F",
  },
  searchButton: {},
});

export default HomeClient;