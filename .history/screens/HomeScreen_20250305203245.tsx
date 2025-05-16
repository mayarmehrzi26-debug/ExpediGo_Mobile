import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Camera } from 'expo-camera'; // Vérifiez que cette bibliothèque est installée
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const HomeScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isAddMode, setIsAddMode] = useState(true);
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraVisible, setCameraVisible] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const stats = [
    {
      title: "Colis livré",
      thisMonth: 20,
      total: 30,
      icon: "https://cdn.builder.io/api/v1/image/assets/f3828464c96d4349b61f8cc61d540aaa/d3ae6bfd5e897a1f1c6d910246a9a5d477636542099404eb1247421cfaf10983?apiKey=f3828464c96d4349b61f8cc61d540aaa&",
    },
    {
      title: "En cours de livraison",
      total: 25,
      icon: "https://cdn.builder.io/api/v1/image/assets/f3828464c96d4349b61f8cc61d540aaa/d3ae6bfd5e897a1f1c6d910246a9a5d477636542099404eb1247421cfaf10983?apiKey=f3828464c96d4349b61f8cc61d540aaa&",
    },
    // Ajoutez d'autres statistiques ici...
  ];

  const updates = [
    { date: "05/02/2024", name: "Salima assadi", phone: "72737272" },
    { date: "06/02/2024", name: "Salima assadi", phone: "72737272" },
  ];

  const toggleButtonMode = () => {
    setIsAddMode(!isAddMode);
    setModalVisible(!modalVisible);
  };

  const openCamera = () => {
    if (hasPermission) {
      setCameraVisible(true);
    } else {
      Alert.alert("Permission refusée", "Vous devez accorder l'accès à la caméra.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Image
          source={require("../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <TouchableOpacity onPress={openCamera}>
          <MaterialIcons name="qr-code-scanner" size={24} color="black" style={{ marginLeft: 190 }} />
        </TouchableOpacity>
        <Ionicons name="notifications-outline" size={24} color="black" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.cashBox}>
          <Text style={styles.cashTitle}>Ma Caisse</Text>
          <View style={styles.cashRow}>
            <Text style={styles.cashLabel}>Cash Disponible</Text>
            <Text style={styles.cashValueBlue}>0,000 dt</Text>
          </View>
          <View style={styles.cashRow}>
            <Text style={styles.cashLabel}>Cash non Disponible</Text>
            <Text style={styles.cashValue}>115,000 dt</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.cashRow}>
            <Text style={[styles.cashLabel, styles.bold]}>Total</Text>
            <Text style={[styles.cashValue, styles.bold]}>115,000 dt</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          {stats.map((item, index) => {
            const thisMonth = item.thisMonth !== undefined ? item.thisMonth : 0;
            return (
              <View key={index} style={styles.statCard}>
                <Image
                  source={{ uri: item.icon }}
                  style={styles.statIcon}
                  resizeMode="contain"
                />
                <Text style={styles.statTitle}>{item.title}</Text>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Ce mois</Text>
                  <Text style={styles.statValue}>{thisMonth}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Total</Text>
                  <Text style={styles.statValue}>{item.total}</Text>
                </View>
              </View>
            );
          })}
        </View>

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
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate('Pickups')}>
          <Ionicons name="cube-outline" size={24} color="gray" />
          <Text style={styles.bottomNavText}>Pickups</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate('Livraison')}>
          <Ionicons name="bicycle-outline" size={24} color="gray" />
          <Text style={styles.bottomNavText}>Livraisons</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.floatingButton}
          onPress={toggleButtonMode}
        >
          <Ionicons
            name={isAddMode ? "add" : "close"}
            size={54}
            color="white"
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate('Support')}>
          <Ionicons name="help-circle-outline" size={24} color="gray" />
          <Text style={styles.bottomNavText}>Support</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem}>
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
                navigation.navigate("EmballageCommand");
              }}
            >
              <Text style={styles.modalButtonText}>Commande d'emballage</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setModalVisible(false);
                setIsAddMode(true);
                navigation.navigate("NouvelleLivraison");
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

      {/* Modal de la caméra */}
      {cameraVisible && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={cameraVisible}
          onRequestClose={() => setCameraVisible(false)}
        >
          <Camera style={styles.camera} ratio="16:9">
            <View style={styles.cameraButtonContainer}>
              <TouchableOpacity onPress={() => setCameraVisible(false)}>
                <Ionicons name="close" size={42} color="white" />
              </TouchableOpacity>
            </View>
          </Camera>
        </Modal>
      )}
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    paddingTop: 30,
  },
  scrollContent: {
    paddingBottom: 100,
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
  cashBox: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  cashTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    color: "#333",
    textAlign: "center",
  },
  cashRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  cashLabel: {
    color: "#666",
    fontSize: 14,
  },
  cashValueBlue: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "600",
  },
  cashValue: {
    color: "#111",
    fontSize: 14,
  },
  bold: {
    fontWeight: "700",
  },
  divider: {
    borderBottomColor: "#E5E7EB",
    borderBottomWidth: 1,
    marginVertical: 8,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: 16,
  },
  statCard: {
    backgroundColor: "#fff",
    width: "48%",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
    alignItems: "center",
  },
  statIcon: {
    width: 40,
    height: 40,
    marginBottom: 8,
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
    backgroundColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -20,
    marginLeft: 22,
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
  camera: {
    flex: 1,
  },
  cameraButtonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});