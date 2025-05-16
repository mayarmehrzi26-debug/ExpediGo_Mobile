import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import { Camera } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import Svg, { G, Path } from "react-native-svg";
import { RootStackParamList } from '../../NavigationTypes'; // Ajustez le chemin selon votre structure
import NavBottomHome from '../../src/components/NavBottomHome';
import BarcodeScanner from '../BarcodeScanner'; // Ajustez le chemin selon votre structure
import OrderCard from '../../src/components/OrderCard';

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
const HomeLivreur: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isAddMode, setIsAddMode] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraVisible, setCameraVisible] = useState(false);

 

  const toggleButtonMode = () => {
    setIsAddMode(!isAddMode);
    setModalVisible(!modalVisible);
  };

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
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <TouchableOpacity onPress={toggleCamera}>
              <MaterialIcons
                name="qr-code-scanner"
                size={24}
                color="black"
                style={{ marginLeft: 140 }}
              />
            </TouchableOpacity>
            <TouchableOpacity  onPress={() => navigation.navigate('Caisse')}>
            <MoneyBagIcon />

            </TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color="black" />
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
          <OrderCard></OrderCard>

          </ScrollView>

        <NavBottomHome></NavBottomHome>

           
          
        </>
      )}
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    paddingTop: 30,

  },
  scrollContent: {
   height:"100%",
borderTopRightRadius:43,
borderTopLeftRadius:43,

    backgroundColor: "#F97316",


  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 78,
  },
  logo: {
    width: 120,
    height: 60,
  },
  addButton: {
    width: 150,
    height: 50,
    borderRadius: 5,
    backgroundColor: "#7d3300",
    justifyContent: "center",
    alignItems: "center",
    marginBottom:12,
    marginLeft:262
  },
  addButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },

});

export default HomeLivreur;