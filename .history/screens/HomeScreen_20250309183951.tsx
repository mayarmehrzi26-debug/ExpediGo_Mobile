import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import { Camera } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RootStackParamList } from '../NavigationTypes'; // Ajustez le chemin selon votre structure
import CashBox from '../src/components/CashBox'; // Ajustez le chemin selon votre structure
import StatsList from '../src/components/StatsList'; // Ajustez le chemin selon votre structure
import BarcodeScanner from './BarcodeScanner'; // Ajustez le chemin selon votre structure

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'HomeScreen'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isAddMode, setIsAddMode] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraVisible, setCameraVisible] = useState(false);

  const updates = [
    { date: '05/02/2025', name: 'Mayar Mehrzi', phone: '72737272' },
    { date: '06/02/2025', name: 'Mayar Mehrzi', phone: '72737272' },
  ];

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
              source={require('../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <TouchableOpacity onPress={toggleCamera}>
              <MaterialIcons
                name="qr-code-scanner"
                size={24}
                color="black"
                style={{ marginLeft: 190 }}
              />
            </TouchableOpacity>
           
            </TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color="black" />
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Utilisation du composant CashBox */}
            <CashBox
              availableCash="0,000 dt"
              unavailableCash="115,000 dt"
              totalCash="115,000 dt"
            />
            
            {/* Utilisation du composant StatsList */}
            <StatsList />

            {/*Mise à jour */}

            <Text style={styles.updateTitle}>Mises à jour</Text>
            {updates.map((item, index) => (
              <View key={index} style={styles.updateBox}>
                <Text style={styles.updateDate}>{item.date}</Text>
                <Text style={styles.updateName}>{item.name}</Text>
                <Text style={styles.updatePhone}>{item.phone}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.bottomNav}>
            <TouchableOpacity
              style={styles.bottomNavItem}
              onPress={() => navigation.navigate('Pickups')}
            >
              <Ionicons name="cube-outline" size={24} color="gray" />
              <Text style={styles.bottomNavText}>Pickups</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.bottomNavItem}
              onPress={() => navigation.navigate('Livraison')}
            >
              <Ionicons name="bicycle-outline" size={24} color="gray" />
              <Text style={styles.bottomNavText}>Livraisons</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.floatingButton} onPress={toggleButtonMode}>
              <Ionicons name={isAddMode ? 'add' : 'close'} size={54} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bottomNavItem}
              onPress={() => navigation.navigate('Support')}
            >
              <Ionicons name="help-circle-outline" size={24} color="gray" />
              <Text style={styles.bottomNavText}>Support</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.bottomNavItem}
              onPress={() => navigation.navigate('Profile')}
            >
              <Ionicons name="person-outline" size={24} color="gray" />
              <Text style={styles.bottomNavText}>Profil</Text>
            </TouchableOpacity>
          </View>

          <Modal
            transparent={true}
            animationType="fade"
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(false);
              setIsAddMode(true);
            }}
          >
            <View style={styles.modalBackground}>
              <View style={styles.modalContainer}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => {
                    setModalVisible(false);
                    setIsAddMode(true);
                    navigation.navigate('EmballageCommand');
                  }}
                >
                  <Text style={styles.modalButtonText}>Commande d'emballage</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => {
                    setModalVisible(false);
                    setIsAddMode(true);
                    navigation.navigate('NouvelleLivraison');
                  }}
                >
                  <Text style={styles.modalButtonText}>Nouvelle livraison</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setModalVisible(false);
                setIsAddMode(true);
              }}
            >
              <Ionicons name="close" size={42} color="white" />
            </TouchableOpacity>
          </Modal>
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
    paddingBottom: 100, // Espace pour la Bottom Nav
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  logo: {
    width: 120,
    height: 60,
  },
  
  
  statTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
    marginBottom: 8,
    textAlign: "center",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginVertical: 2,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  statValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#F97316",
  },
  updateTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginLeft: 16,
    marginBottom: 8,
  },
  updateBox: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  updateDate: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  updateName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F97316",
    marginBottom: 2,
  },
  updatePhone: {
    fontSize: 14,
    color: "#333",
  },
  bottomNav: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: "#000",
  },
  bottomNavItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  bottomNavText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  floatingButton: {
    width: 66,
    height: 66,
    borderRadius: 38,
    borderColor: "#7d3300",
    backgroundColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -20,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "80%",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 393,
  },
  modalButton: {
    marginVertical: 10,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    borderColor: "#F97316",
    borderWidth: 2,
  },
  modalButtonText: {
    color: "#F97316",
    fontWeight: "600",
  },
  closeButton: {
    width: 66,
    height: 66,
    borderRadius: 38,
    backgroundColor: "#F97316",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 12,
    justifyContent: "center",
  },
 
});

export default HomeScreen;