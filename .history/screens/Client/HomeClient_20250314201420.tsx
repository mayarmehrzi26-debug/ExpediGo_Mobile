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

import Svg, { G, Path } from "react-native-svg";
import { RootStackParamList } from '../../NavigationTypes'; // Ajustez le chemin selon votre structure
import NavBottomClient from '../../src/components/NavBottomClient';
import BarcodeScanner from '../BarcodeScanner'; // Ajustez le chemin selon votre structure

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'HomeLivreur'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const MoneyBagIcon = (props) => (
  <Svg
    fill="none"
    height={30}
    viewBox="0 0 48 48"
    width={48}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <G clipRule="evenodd" fill="#333" fillRule="evenodd">
      <Path d="m24.0433 4c-5.0184 0-9.5915 1.65746-12.2964 3.01231-.2438.12208-.4723.24171-.6847.35744-.4202.22903-.777.44281-1.0622.63025l3.0777 4.5307 1.4486.5767c5.6626 2.8571 13.2562 2.8571 18.9188 0l1.6449-.8534 2.91-4.254c-.4264-.2843-1.0162-.62922-1.7419-.99597-.0442-.02236-.0889-.04479-.1342-.0673-2.6932-1.3401-7.1552-2.93673-12.0806-2.93673zm-7.1581 5.12906c-1.1076-.20435-2.1959-.4862-3.2232-.80957 2.5348-1.12555 6.3123-2.31949 10.3813-2.31949 2.8193 0 5.4849.57325 7.6897 1.2991-2.5838.36474-5.3411.98045-7.9676 1.74029-2.0667.59788-4.4825.53208-6.8802.08967z" />
      <Path d="m34.6185 14.7556-.2724.1374c-6.2293 3.143-14.4915 3.143-20.7207 0l-.259-.1306c-9.35732 10.268-19.17397 29.5229 10.6769 29.2344 29.8304-.2883 19.86-19.3207 10.5752-29.2412zm-8.9072 7.2444h-3.4226v1.6c-1.1122-.0026-2.1816.3999-2.9819 1.1222-.8001.7221-1.268 1.7072-1.3045 2.7465s.3613 2.051 1.109 2.8207c.7478.7697 1.7868 1.2369 2.8968 1.3026l.2806.008h3.4226l.154.0128c.1973.0334.3758.1305.5043.2744.1285.1438.199.3254.199.5128s-.0705.369-.199.5128c-.1285.1439-.307.241-.5043.2744l-.154.0128h-6.8452v3.2h3.4226v1.6h3.4226v-1.6c1.1122.0026 2.1816-.3999 2.9819-1.1222.8001-.7221 1.268-1.7072 1.3045-2.7465s-.3613-2.051-1.109-2.8207c-.7478-.7697-1.7868-1.2369-2.8968-1.3026l-.2806-.008h-3.4226l-.154-.0128c-.1973-.0334-.3758-.1305-.5043-.2744-.1285-.1438-.199-.3254-.199-.5128s.0705-.369.199-.5128c.1285-.1439.307-.241.5043-.2744l.154-.0128h6.8452v-3.2h-3.4226z" />
    </G>
  </Svg>
);

const HomeClient: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isAddMode, setIsAddMode] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraVisible, setCameraVisible] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2, // Agrandir légèrement
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1, // Revenir à la taille normale
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  const fadeAnim = useRef(new Animated.Value(0.3)).current; // Départ avec opacité faible

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1, // Augmente l'opacité
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3, // Diminue l'opacité
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  // Demander la permission pour utiliser la caméra
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const toggleCamera = () => {
    setCameraVisible(!cameraVisible);
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
           
            <Ionicons name="notifications-outline" size={24} color="#F7F7F7"  style={{ marginRight: 10 }} />
          </View>
          <View style={styles.packageImageContainer}>
            
           <Image 
             source={require("../../assets/parcel.png")}
              style={styles.packageImage} 
              resizeMode="contain"
            />
            </View>
          <ScrollView >
                 
            <View style={styles.searchContainer}>
  <TextInput
    style={styles.searchInput}
    placeholder="Entrez le numéro de commande..."
    placeholderTextColor="#A7A9B7"
  />
  <TouchableOpacity style={styles.searchButton}>
    <Ionicons name="search" size={20} color="#27251F" />
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
    marginBottom: 60, 
    paddingLeft:10,

    // Réduit l'espace en bas
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
    marginTop: -120, // Déplace l'image vers le haut
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
  searchButton: {
  },
  
});

export default HomeClient;