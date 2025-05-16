import { Ionicons } from "@expo/vector-icons";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { firebasestore } from "../FirebaseConfig";

interface EmballageCommandProps {
  navigation: any; // Vous pouvez remplacer `any` par le type approprié pour votre navigation
}

const EmballageCommand: React.FC<EmballageCommandProps> = ({ navigation }) => {
  const [successModalVisible, setSuccessModalVisible] = useState(false);
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
  const totalPrice = (selectedSizeData?.price * (parseInt(quantity) || 0)) / 1000 || 0;

  const handleQuantityChange = useCallback((text: string) => {
    if (/^\d*$/.test(text)) {
      setQuantity(text);
    }
  }, []);

  const handleOrder = useCallback(async () => {
    if (!quantity || parseInt(quantity) <= 0) {
      Alert.alert("Erreur", "Veuillez entrer une quantité valide.");
      return;
    }

    try {
      await addDoc(collection(firebasestore, "orders"), {
        size: selectedSizeData.label,
        quantity: parseInt(quantity),
        price: (selectedSizeData?.price || 0) / 1000,

        totalPrice: totalPrice,
        timestamp: serverTimestamp(),
      });

      setSuccessModalVisible(true);
      setQuantity("");
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la commande : ", error);
      Alert.alert("Erreur", "Une erreur s'est produite lors de l'enregistrement de la commande.");
    }
  }, [quantity, selectedSizeData, totalPrice]);

  const renderSizeOption = (size: typeof sizes[number]) => (
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
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Commandes d'emballage</Text>

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("EmballageList")}>
  <Ionicons name="time-outline" size={24} color="black" style={styles.headerImage} />
</TouchableOpacity>

      </View>

      <ScrollView style={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>La taille de l'emballage</Text>
          <View style={styles.sizesContainer}>{sizes.map(renderSizeOption)}</View>

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
              <Text style={styles.priceValue}>{totalPrice.toFixed(2)} Dinars</Text>
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

        <TouchableOpacity style={styles.floatingButton}>
          <Ionicons name={"add"} size={54} color="white" />
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

      {/* Modal de succès */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={successModalVisible}
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Ionicons name="checkmark-circle" size={60} color="#FD5A1E" />
            <Text style={styles.modalTitle}>Commande d'emballage envoyée avec succès!</Text>
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSuccessModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
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
    paddingBottom: 24,
  },
  backButton: {
    width: 46,
    height: 47,
    justifyContent: "center",
    alignItems: "center",
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
    paddingTop: 12,
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
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    textAlign: "center",
  },
  modalDetails: {
    fontSize: 14,
    color: "#27251F",
    marginVertical: 10,
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: "#FD5A1E",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  closeButtonText: {
    color: "#FFF",
    fontWeight: "600",
  },
});

export default EmballageCommand;