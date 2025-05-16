import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import CustomCheckbox from "../components/CustomCheckbox";
import CustomDropdown from "../components/CustomDropdown";
import CustomToggle from "../components/CustomToggle";
import {
  saveNewDelivery,
  selectNouvelleLivraisonState,
  setQuantity,
  setSelectedAddress,
  setSelectedClient,
  setSelectedPayment,
  setSelectedProduct,
  toggleExchange,
  toggleFragile,
  toggleTermsAccepted,
} from "../redux/livraisonSlice";
import { selectNouvelleLivraisonState } from '../redux/livraisonSlice';

const NouvelleLivraisonScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {
    adresses,
    clients,
    products,
    paiementOptions,
    selectedAddress,
    selectedClient,
    selectedProduct,
    selectedPayment,
    quantity,
    isExchange,
    isFragile,
    termsAccepted,
    totalAmount,
  } = useSelector(selectNouvelleLivraisonState);

  const handleSave = async () => {
    if (!termsAccepted) {
      alert("Veuillez accepter les conditions générales");
      return;
    }
    
    try {
      const success = await dispatch(saveNewDelivery());
      if (success) navigation.goBack();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      alert("Une erreur est survenue lors de l'enregistrement");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          testID="back-button"
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouvelle livraison</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adresse de pickup</Text>
          <CustomDropdown
            placeholder="Sélectionnez une adresse"
            options={adresses}
            selectedValue={selectedAddress}
            onSelect={(value) => dispatch(setSelectedAddress(value))}
            testID="address-dropdown"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client</Text>
          <CustomDropdown
            placeholder="Sélectionnez un client"
            options={clients}
            selectedValue={selectedClient}
            onSelect={(value) => dispatch(setSelectedClient(value))}
            testID="client-dropdown"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Produit</Text>
          <CustomDropdown
            placeholder="Sélectionnez un produit"
            options={products}
            selectedValue={selectedProduct}
            onSelect={(value) => dispatch(setSelectedProduct(value))}
            testID="product-dropdown"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paiement</Text>
          <CustomDropdown
            placeholder="Sélectionnez le mode de paiement"
            options={paiementOptions}
            selectedValue={selectedPayment}
            onSelect={(value) => dispatch(setSelectedPayment(value))}
            testID="payment-dropdown"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quantité</Text>
          <CustomDropdown
            placeholder="1"
            options={[1, 2, 3, 4, 5].map((q) => ({ label: q.toString(), value: q.toString() }))}
            selectedValue={quantity?.toString() || "1"}
            onSelect={(value) => dispatch(setQuantity(Number(value)))}
            testID="quantity-dropdown"
          />
        </View>

        <View style={styles.toggleContainer}>
          <CustomToggle 
            label="Échange" 
            isEnabled={isExchange} 
            onToggle={() => dispatch(toggleExchange())} 
            testID="exchange-toggle"
          />
          <CustomToggle 
            label="Fragile" 
            isEnabled={isFragile} 
            onToggle={() => dispatch(toggleFragile())} 
            testID="fragile-toggle"
          />
        </View>

        <View style={styles.checkboxContainer}>
          <CustomCheckbox
            label="J'accepte les conditions générales"
            checked={termsAccepted}
            onToggle={() => dispatch(toggleTermsAccepted())}
            testID="terms-checkbox"
          />
        </View>

        <Text style={styles.totalAmountText}>Montant total : {totalAmount ?? 0} TND</Text>

        <TouchableOpacity 
          style={[styles.saveButton, !termsAccepted && styles.disabledButton]} 
          onPress={handleSave}
          disabled={!termsAccepted}
          testID="save-button"
        >
          <Text style={styles.saveButtonText}>Enregistrer la livraison</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  toggleContainer: {
    marginVertical: 15,
  },
  checkboxContainer: {
    marginVertical: 15,
  },
  totalAmountText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default NouvelleLivraisonScreen;