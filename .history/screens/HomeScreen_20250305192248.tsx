import { Ionicons } from "@expo/vector-icons";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useState } from "react";
import {
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
  const [isAddMode, setIsAddMode] = useState(true); // État pour suivre le mode du bouton

  const stats = [
    {
      title: "Colis livré",
      thisMonth: 20,
      total: 30,
      icon:
        "https://cdn.builder.io/api/v1/image/assets/f3828464c96d4349b61f8cc61d540aaa/d3ae6bfd5e897a1f1c6d910246a9a5d477636542099404eb1247421cfaf10983?apiKey=f3828464c96d4349b61f8cc61d540aaa&",
    },
    {
      title: "En cours de livraison",
      total: 25,
      icon:
        "https://cdn.builder.io/api/v1/image/assets/f3828464c96d4349b61f8cc61d540aaa/d3ae6bfd5e897a1f1c6d910246a9a5d477636542099404eb1247421cfaf10983?apiKey=f3828464c96d4349b61f8cc61d540aaa&",
    },
    {
      title: "Retour provisoire",
      total: 5,
      icon:
        "https://cdn.builder.io/api/v1/image/assets/f3828464c96d4349b61f8cc61d540aaa/a8f7adda7063ca3ff4b62e19aaced474d2d8136bee66777b8cf8cc8b4f5dd8d9?apiKey=f3828464c96d4349b61f8cc61d540aaa&",
    },
    {
      title: "En vérification",
      total: 2,
      icon:
        "https://cdn.builder.io/api/v1/image/assets/f3828464c96d4349b61f8cc61d540aaa/d3ae6bfd5e897a1f1c6d910246a9a5d477636542099404eb1247421cfaf10983?apiKey=f3828464c96d4349b61f8cc61d540aaa&",
    },
    {
      title: "Pick-Ups assuré",
      thisMonth: 10,
      total: 25,
      icon:
        "https://cdn.builder.io/api/v1/image/assets/f3828464c96d4349b61f8cc61d540aaa/a69f6f786492da9595e4e661bada9bd2dded0637147d7f31b09e87d787b9eaff?apiKey=f3828464c96d4349b61f8cc61d540aaa&",
    },
    {
      title: "Nouveaux Pick-Ups",
      total: 20,
      icon:
        "https://cdn.builder.io/api/v1/image/assets/f3828464c96d4349b61f8cc61d540aaa/d970e48a501d4239675dfac3ff96a586e18d067cee0fa3043e48ff2cb408039f?apiKey=f3828464c96d4349b61f8cc61d540aaa&",
    },
    {
      title: "Retour définitif",
      thisMonth: 0,
      total: 5,
      icon:
        "https://cdn.builder.io/api/v1/image/assets/f3828464c96d4349b61f8cc61d540aaa/805b6fc5b958b09c22d8dd80beb8cdf299532a506a6c119e8e80d2569ec3f9be?apiKey=f3828464c96d4349b61f8cc61d540aaa&",
    },
    {
      title: "Retour prêt",
      thisMonth: 0,
      total: 8,
      icon:
        "https://cdn.builder.io/api/v1/image/assets/f3828464c96d4349b61f8cc61d540aaa/34133fa739231208b58981d85f84bec31dce9f8294f514a746615ee301ccbe98?apiKey=f3828464c96d4349b61f8cc61d540aaa&",
    },
  ];

  const updates = [
    { date: "05/02/2024", name: "Salima assadi", phone: "72737272" },
    { date: "06/02/2024", name: "Salima assadi", phone: "72737272" },
  ];

  const toggleButtonMode = () => {
    setIsAddMode(!isAddMode); // Inversez le mode du bouton
    setModalVisible(!modalVisible); // Ouvrir ou fermer le modal
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Image
          source={require("../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
                <MaterialIcons name="document-scanner" size={24} color="black" />

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
        <TouchableOpacity style={styles.bottomNavItem}  onPress={() => navigation.navigate('Livraison')}>
          <Ionicons name="bicycle-outline" size={24} color="gray" />
          <Text style={styles.bottomNavText}>Livraisons</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.floatingButton}
          onPress={toggleButtonMode}
        >
          <Ionicons
            name={"add" } 
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
    setIsAddMode(true); // Réinitialiser le bouton en mode "+"
  }}
>
  <View style={styles.modalBackground}>
    {/* Bouton "X" centré en haut du modal */}
    

    <View style={styles.modalContainer}>
      <TouchableOpacity
        style={styles.modalButton}
        onPress={() => {
          setModalVisible(false);
          setIsAddMode(true);
          navigation.navigate("EmballageCommand"); // Redirige vers EmballageCommand

        }}
      >
        <Text style={styles.modalButtonText}>Commande d'emballage</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.modalButton}
        onPress={() => {
          setModalVisible(false);
          setIsAddMode(true);
          navigation.navigate("NouvelleLivraison"); // Redirige vers EmballageCommand


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
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 6,
    paddingLeft:22,
  },
  bottomNavItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginLeft: 4,
    justifyContent: "space-around",


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
  marginTop: -20, // Pour que le bouton s'intègre dans la Bottom Nav
  marginLeft:32,
},
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Add slight transparency for better visibility
  },
  modalContainer: {
    width: "80%",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    marginTop:393, 


  },
  modalButton: {
    marginVertical: 10,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    borderColor: "#F97316",  // Add your desired color here
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
  alignSelf: "center", // Centre horizontalement
marginBottom:12,
  justifyContent: "center",
  },
  
});