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
  StyleSheet,
  Text,
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
            <Image
                          source={require('../../assets/expedigo.png')}
                          style={styles.logo}
                          resizeMode="contain"
                        />
            <Ionicons name="notifications-outline" size={24} color="#F7F7F7" style={{ marginLeft: 190, marginTop:22}} />
          </View>
          <View style={styles.scanner}>
          <TouchableOpacity onPress={toggleCamera}>
              <MaterialIcons
                name="qr-code-scanner"
                size={124}
                color="#3E3D54"
              />
            </TouchableOpacity>
            </View>
           <View ><Text style={styles.text}>OR</Text></View> 
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
            <View style={styles.buttonContainer}>
      {/* Get Package Button */}
      <TouchableOpacity style={styles.button}   onPress={() => navigation.navigate("Colis")}
      >
        <Ionicons name="cube-outline" size={24} color="#877DAB" />
        <Text style={styles.buttonText}>Mes colis</Text>
      </TouchableOpacity>

      {/* Delivery Status Button */}
      <TouchableOpacity style={styles.button}>
        <Ionicons name="chatbox-outline" size={24} color="#877DAB" />
        <Text style={styles.buttonText}>Contact</Text>
      </TouchableOpacity>

      {/* Tracking Button */}
      <TouchableOpacity style={styles.button} >
        <Ionicons name="person-outline" size={24} color="#877DAB" />
        <Text style={styles.buttonText}>Profile</Text>
      </TouchableOpacity>
    </View>
           
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
  logo: {
    width: 125,
    height: 60,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 10,
  },
  button: {
    backgroundColor: '#F2F2F7',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    marginTop: 8,
    fontSize: 12,
    color: '#877DAB',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: "#ffff",
    paddingBottom: 210,
  },
  headerContainer: {
    paddingRight: 10,
    paddingTop:40,
    flexDirection: 'row',

  },
  scanner: {
    alignItems: "center",
    paddingTop:32

  },
  
  packageImage: {
    width: 280,
    height: 260,
  },
  packageImageContainer: {
    alignItems: 'center',
    paddingTop:25

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
    marginTop: 20,
    marginRight:60,
    marginLeft:60

  },
  searchInput: {
    flex: 1,
    fontSize: 11,
    color: "#27251F",
  },
  searchButton: {},
  text:{
color:"#fff",
alignSelf:"center",
paddingTop:20,
fontWeight: "bold",

  }
});

export default HomeClient;