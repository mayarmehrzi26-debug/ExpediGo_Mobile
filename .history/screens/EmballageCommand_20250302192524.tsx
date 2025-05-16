import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const EmballageCommand = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isAddMode, setIsAddMode] = useState(true);
  const [selectedSize, setSelectedSize] = useState("petit");
  const [quantity, setQuantity] = useState("");

  const sizes = [
    {
      id: "petit",
      label: "Petit",
      dimensions: "30x30 (cm)",
      price: 250,
      available: true,
    },
    {
      id: "large",
      label: "Large",
      dimensions: "40x50 (cm)",
      price: 300,
      available: true,
    },
    { id: "moyen", label: "Moyen", dimensions: "", price: 0, available: false },
    {
      id: "xlarge",
      label: "Extra large",
      dimensions: "",
      price: 0,
      available: false,
    },
  ];

  const selectedSizeData = sizes.find((size) => size.id === selectedSize);
  const totalPrice = selectedSizeData?.price * (parseInt(quantity) || 0) || 0;

  const toggleButtonMode = useCallback(() => {
    setIsAddMode(!isAddMode);
    setModalVisible(!modalVisible);
  }, [isAddMode, modalVisible]);

  const handleQuantityChange = useCallback((text: string) => {
    if (/^\d*$/.test(text)) {
      setQuantity(text);
    }
  }, []);

  const handleOrder = useCallback(() => {
    if (!quantity || parseInt(quantity) <= 0) {
      Alert.alert("Erreur", "Veuillez entrer une quantité valide.");
      return;
    }
    Alert.alert("Succès", "Votre commande a été passée avec succès.");
  }, [quantity]);

  const renderSizeOption = (size: (typeof sizes)[0]) => (
    <TouchableOpacity
      key={size.id}
      style={[
        styles.sizeOption,
        selectedSize === size.id && styles.selectedSizeOption,
        !size.available && styles.disabledSizeOption,
      ]}
      onPress={() => size.available && setSelectedSize(size.id)}
      disabled={!size.available}
    >
      <View style={styles.sizeOptionContent}>
        <Text
          style={[
            styles.sizeLabel,
            selectedSize === size.id && styles.selectedSizeLabel,
            !size.available && styles.disabledText,
          ]}
        >
          {size.label}
        </Text>
        <Text
          style={[
            styles.sizeDimensions,
            selectedSize === size.id && styles.selectedSizeDimensions,
            !size.available && styles.disabledText,
          ]}
        >
          {size.available ? size.dimensions : "Non disponible pour le moment."}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <View style={styles.backButtonCircle} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Commandes d'emballage</Text>
        <Image
          source={{
            uri: "https://cdn.builder.io/api/v1/image/assets/f3828464c96d4349b61f8cc61d540aaa/b8e21b2f033c4d3b2deb3328629efd8af7fe5cd49ce841d7f1f26607abb6b54f?placeholderIfAbsent=true",
          }}
          style={styles.headerImage}
        />
      </View>

      <ScrollView style={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>La taille du l'emballage</Text>
          <View style={styles.sizesContainer}>
            {sizes.map(renderSizeOption)}
          </View>

          <View style={styles.quantitySection}>
            <Text style={styles.sectionTitle}>Quantité</Text>
            <TextInput
              style={styles.quantityInput}
              value={quantity}
              onChangeText={handleQuantityChange}
              keyboardType="numeric"
              placeholder="Entrez la quantité"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.priceContainer}>
            <View>
              <Text style={styles.priceLabel}>Prix unitaire (TTC)</Text>
              <Text style={styles.priceLabel}>Prix total (TTC)</Text>
            </View>
            <View style={styles.priceValues}>
              <Text style={styles.priceValue}>
                {selectedSizeData?.price || 0} millimes
              </Text>
              <Text style={styles.priceValue}>
                {totalPrice.toFixed(2)} Dinars
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.orderButton} onPress={handleOrder}>
            <Text style={styles.orderButtonText}>Commander</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
             <TouchableOpacity style={styles.bottomNavItem}>
               <Ionicons name="cube-outline" size={24} color="gray" />
               <Text style={styles.bottomNavText}>Pickups</Text>
             </TouchableOpacity>
             <TouchableOpacity style={styles.bottomNavItem}>
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
     
             <TouchableOpacity style={styles.bottomNavItem}>
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
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              setModalVisible(false);
              setIsAddMode(true);
            }}
          >
            <Ionicons name="close" size={42} color="white" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 51,
    paddingBottom: 14,
  },
  backButton: {
    width: 46,
    height: 47,
    justifyContent: "center",
  },
  backButtonCircle: {
    width: 46,
    height: 47,
    borderRadius: 30,
    borderColor: "rgba(232, 236, 244, 1)",
    borderWidth: 1,
  },
  headerTitle: {
    color: "#27251F",
    fontFamily: "Avenir",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
    flex: 1,
  },
  headerImage: {
    width: 46,
    height: 46,
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  sectionTitle: {
    color: "#27251F",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 16,
  },
  sizesContainer: {
    gap: 9,
  },
  sizeOption: {
    borderRadius: 9,
    padding: 10,
    borderWidth: 1,
    borderColor: "#D4D4D4",
  },
  selectedSizeOption: {
    borderColor: "#FD5A1E",
  },
  disabledSizeOption: {
    opacity: 0.5,
  },
  sizeOptionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sizeLabel: {
    color: "#27251F",
    fontSize: 14,
    fontWeight: "500",
  },
  selectedSizeLabel: {
    color: "#FD5A1E",
  },
  sizeDimensions: {
    color: "#27251F",
    fontSize: 14,
    textAlign: "right",
  },
  selectedSizeDimensions: {
    color: "#FD5A1E",
  },
  disabledText: {
    color: "#D4D4D4",
  },
  quantitySection: {
    marginTop: 17,
  },
  quantityInput: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#A7A9B7",
    height: 42,
    paddingHorizontal: 10,
  },
  divider: {
    height: 2,
    backgroundColor: "rgba(167, 169, 183, 0.21)",
    marginVertical: 17,
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  priceLabel: {
    color: "#27251F",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 28,
  },
  priceValues: {
    alignItems: "flex-end",
  },
  priceValue: {
    color: "#27251F",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 28,
  },
  orderButton: {
    backgroundColor: "#FD5A1E",
    borderRadius: 8,
    paddingVertical: 18,
    paddingHorizontal: 70,
    marginTop: 72,
    alignItems: "center",
  },
  orderButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "800",
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
  },
  bottomNavItem: {
    alignItems: "center",
    width: 38,
    height: 43,
  },
  navIcon: {
    width: 19,
    height: 22,
    resizeMode: "contain",
  },
  navIconPlaceholder: {
    width: 30,
    height: 23,
  },
  bottomNavText: {
    marginTop: 4,
    fontSize: 7,
    color: "#27251F",
    fontWeight: "800",
    textAlign: "center",
  },
  floatingButton: {
    width: 66,
    height: 66,
    borderRadius: 38,
    backgroundColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -20, // Pour que le bouton s'intègre dans la Bottom Nav
  },
  floatingButtonImage: {
    position: "absolute",
    width: 61,
    height: 61,
    top: -21,
    left: 17.5,
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
    marginBottom: 7,
    justifyContent: "center",
  },
});

export default EmballageCommand;
