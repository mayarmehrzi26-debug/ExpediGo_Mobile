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
  navigation: any;
}

const EmballageCommand: React.FC<EmballageCommandProps> = ({ navigation }) => {
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [selectedSize, setSelectedSize] = useState("petit");
  const [quantity, setQuantity] = useState("");

  const sizes = [
    { id: "petit", label: "Petit", price: 250, available: true },
    { id: "large", label: "Large", price: 300, available: true },
    { id: "moyen", label: "Moyen", price: 0, available: false },
    { id: "xlarge", label: "Extra large", price: 0, available: false },
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
        size: selectedSizeData?.label,
        price: selectedSizeData?.price || 0,
        quantity: parseInt(quantity),
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

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>La taille de l'emballage</Text>
          <View style={styles.sizesContainer}>
            {sizes.map((size) => (
              <TouchableOpacity
                key={size.id}
                style={[styles.sizeOption, selectedSize === size.id && styles.selectedSizeOption]}
                onPress={() => size.available && setSelectedSize(size.id)}
                disabled={!size.available}
              >
                <Text style={[styles.sizeLabel, selectedSize === size.id && styles.selectedSizeLabel]}>
                  {size.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Quantité</Text>
          <TextInput
            style={styles.quantityInput}
            value={quantity}
            onChangeText={handleQuantityChange}
            keyboardType="numeric"
            placeholder="Entrez la quantité"
          />

          <Text style={styles.priceLabel}>Prix unitaire: {selectedSizeData?.price || 0} millimes</Text>
          <Text style={styles.priceLabel}>Prix total: {totalPrice.toFixed(2)} Dinars</Text>

          <TouchableOpacity style={styles.orderButton} onPress={handleOrder}>
            <Text style={styles.orderButtonText}>Commander</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal transparent={true} visible={successModalVisible}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Ionicons name="checkmark-circle" size={60} color="#FD5A1E" />
            <Text style={styles.modalTitle}>Commande envoyée avec succès!</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setSuccessModalVisible(false)}>
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F7F7" },
  scrollContent: { flex: 1 },
  content: { padding: 24 },
  sectionTitle: { fontSize: 14, fontWeight: "500", marginBottom: 16 },
  sizesContainer: { gap: 9 },
  sizeOption: { padding: 10, borderWidth: 1, borderColor: "#D4D4D4", borderRadius: 9 },
  selectedSizeOption: { borderColor: "#FD5A1E" },
  sizeLabel: { fontSize: 14, fontWeight: "500" },
  selectedSizeLabel: { color: "#FD5A1E" },
  quantityInput: { borderRadius: 8, borderWidth: 1, borderColor: "#A7A9B7", height: 42, paddingHorizontal: 10 },
  priceLabel: { fontSize: 14, fontWeight: "800", marginVertical: 8 },
  orderButton: { backgroundColor: "#FD5A1E", borderRadius: 8, paddingVertical: 18, alignItems: "center" },
  orderButtonText: { color: "#FFF", fontSize: 15, fontWeight: "800" },
  modalBackground: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.5)" },
  modalContainer: { padding: 20, borderRadius: 10, backgroundColor: "white", alignItems: "center" },
  modalTitle: { fontSize: 18, fontWeight: "bold", textAlign: "center" },
  closeButton: { backgroundColor: "#FD5A1E", padding: 10, borderRadius: 5, marginTop: 10 },
  closeButtonText: { color: "#FFF", fontWeight: "600" },
});

export default EmballageCommand;
