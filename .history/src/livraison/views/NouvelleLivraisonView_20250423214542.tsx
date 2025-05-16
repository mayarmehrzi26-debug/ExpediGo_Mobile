import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import CustomCheckbox from "../components/CustomCheckbox";
import CustomDropdown from "../components/CustomDropdown";
import CustomToggle from "../../components/CustomToggle";
import {
  clearError,
  fetchAddresses,
  fetchClients,
  fetchPaymentOptions,
  fetchProducts,
  resetDeliveryForm,
  saveNewDelivery,
  selectAddresses,
  selectClients,
  selectError,
  selectIsExchange,
  selectIsFragile,
  selectLoading,
  selectPaymentOptions,
  selectProducts,
  selectQuantity,
  selectSelectedAddress,
  selectSelectedClient,
  selectSelectedPayment,
  selectSelectedProduct,
  selectTermsAccepted,
  selectTotalAmount,
  setQuantity,
  setSelectedAddress,
  setSelectedClient,
  setSelectedPayment,
  setSelectedProduct,
  toggleExchange,
  toggleFragile,
  toggleTermsAccepted
} from "../redux/livraisonSlice";

const NouvelleLivraisonScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // Sélection des données depuis le store
  const addresses = useSelector(selectAddresses);
  const clients = useSelector(selectClients);
  const products = useSelector(selectProducts);
  const paymentOptions = useSelector(selectPaymentOptions);
  const selectedAddress = useSelector(selectSelectedAddress);
  const selectedClient = useSelector(selectSelectedClient);
  const selectedProduct = useSelector(selectSelectedProduct);
  const selectedPayment = useSelector(selectSelectedPayment);
  const quantity = useSelector(selectQuantity);
  const isExchange = useSelector(selectIsExchange);
  const isFragile = useSelector(selectIsFragile);
  const termsAccepted = useSelector(selectTermsAccepted);
  const totalAmount = useSelector(selectTotalAmount);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  // Chargement des données initiales
  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchClients());
    dispatch(fetchAddresses());
    dispatch(fetchPaymentOptions());
  }, [dispatch]);

  // Gestion des erreurs
  useEffect(() => {
    if (error) {
      Alert.alert("Erreur", error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSave = async () => {
    if (!termsAccepted) {
      Alert.alert("Attention", "Veuillez accepter les conditions générales");
      return;
    }

    if (!selectedAddress || !selectedClient || !selectedProduct || !selectedPayment) {
      Alert.alert("Attention", "Veuillez remplir tous les champs obligatoires");
      return;
    }

    const resultAction = await dispatch(saveNewDelivery());
    if (saveNewDelivery.fulfilled.match(resultAction)) {
      Alert.alert("Succès", "Livraison enregistrée avec succès");
      dispatch(resetDeliveryForm());
      navigation.goBack();
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

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
            options={addresses}
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
            options={paymentOptions}
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
  selectedValue={quantity ? quantity.toString() : "1"}
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

        <Text style={styles.totalAmountText}>
  Montant total : {(totalAmount ?? 0).toFixed(2)} TND
</Text>
        <TouchableOpacity 
          style={[styles.saveButton, !termsAccepted && styles.disabledButton]} 
          onPress={handleSave}
          disabled={!termsAccepted || loading}
          testID="save-button"
        >
          <Text style={styles.saveButtonText}>
            {loading ? "Enregistrement..." : "Enregistrer la livraison"}
          </Text>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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