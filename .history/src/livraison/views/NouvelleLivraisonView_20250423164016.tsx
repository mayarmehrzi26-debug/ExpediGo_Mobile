import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import {
  selectNouvelleLivraisonState,
  toggleExchange,
  toggleFragile,
  toggleTermsAccepted,
  setSelectedAddress,
  setSelectedClient,
  setSelectedProduct,
  setSelectedPayment,
  setQuantity,
  saveNewDelivery,
} from "../redux/livraisonSlice";
import CustomDropdown from "../components/CustomDropdown";
import CustomToggle from "../components/CustomToggle";
import CustomCheckbox from "../components/CustomCheckbox";

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
    const success = await dispatch(saveNewDelivery());
    if (success) navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouvelle livraison</Text>
      </View>

      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adresse de pickup</Text>
          <CustomDropdown
            placeholder="Sélectionnez une adresse"
            options={adresses}
            selectedValue={selectedAddress}
            onSelect={(value) => dispatch(setSelectedAddress(value))}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client</Text>
          <CustomDropdown
            placeholder="Sélectionnez un client"
            options={clients}
            selectedValue={selectedClient}
            onSelect={(value) => dispatch(setSelectedClient(value))}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Produit</Text>
          <CustomDropdown
            placeholder="Sélectionnez un produit"
            options={products}
            selectedValue={selectedProduct}
            onSelect={(value) => dispatch(setSelectedProduct(value))}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paiement</Text>
          <CustomDropdown
            placeholder="Sélectionnez le mode de paiement"
            options={paiementOptions}
            selectedValue={selectedPayment}
            onSelect={(value) => dispatch(setSelectedPayment(value))}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quantité</Text>
          <CustomDropdown
            placeholder="1"
            options={[1, 2, 3, 4, 5].map((q) => ({ label: q.toString(), value: q.toString() }))}
            selectedValue={quantity.toString()}
            onSelect={(value) => dispatch(setQuantity(Number(value)))}
          />
        </View>

        <CustomToggle label="Échange" isEnabled={isExchange} onToggle={() => dispatch(toggleExchange())} />
        <CustomToggle label="Fragile" isEnabled={isFragile} onToggle={() => dispatch(toggleFragile())} />

        <CustomCheckbox
          label="J'accepte les conditions générales"
          checked={termsAccepted}
          onToggle={() => dispatch(toggleTermsAccepted())}
        />

        <Text style={styles.totalAmountText}>Montant total : {totalAmount} TND</Text>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Enregistrer la livraison</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default NouvelleLivraisonScreen;
