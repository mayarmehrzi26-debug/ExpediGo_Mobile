import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import { Camera } from 'expo-camera';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { firebasestore } from '../../FirebaseConfig';
import { RootStackParamList } from '../../NavigationTypes';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'HomeClient'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const HomeClient: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [trackingCode, setTrackingCode] = useState('');
  const [cameraVisible, setCameraVisible] = useState(false);
  
  const toggleCamera = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status === 'granted') {
      setCameraVisible(true);
    } else {
      alert("Permission pour accéder à la caméra refusée.");
    }
  };

  const closeCamera = () => setCameraVisible(false);

  const searchOrderByTrackingCode = async () => {
    if (!trackingCode) {
      alert("Veuillez entrer un code de suivi.");
      return;
    }

    try {
      const orderRef = doc(firebasestore, 'livraisons', trackingCode);
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
    <View style={styles.container}>
      {cameraVisible ? (
        <Camera
          style={StyleSheet.absoluteFillObject}
          onBarCodeScanned={(data) => {
            setTrackingCode(data.data);
            setCameraVisible(false);
          }}
        >
          <TouchableOpacity style={styles.closeButton} onPress={closeCamera}>
            <Ionicons name="close" size={32} color="#fff" />
          </TouchableOpacity>
        </Camera>
      ) : (
        <>
          <View style={styles.headerContainer}>
            <Ionicons name="notifications-outline" size={24} color="#F7F7F7" />
          </View>
          <View style={styles.scanner}>
            <TouchableOpacity onPress={toggleCamera}>
              <MaterialIcons name="qr-code-scanner" size={124} color="#3E3D54" />
            </TouchableOpacity>
          </View>
          <View>
            <Text style={styles.text}>OR</Text>
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
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffff',
  },
  headerContainer: {
    alignItems: 'flex-end',
    paddingRight: 10,
    paddingTop: 60,
  },
  scanner: {
    alignItems: 'center',
    paddingTop: 32,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 35,
    paddingHorizontal: 8,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    marginTop: 20,
    marginHorizontal: 60,
  },
  searchInput: {
    flex: 1,
    fontSize: 11,
    color: '#27251F',
  },
  searchButton: {},
  text: {
    color: '#fff',
    alignSelf: 'center',
    paddingTop: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 20,
  },
});

export default HomeClient;
