import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/Feather";
import { useDispatch, useSelector } from "react-redux";
import CustomCheckbox from "../../components/CustomCheckbox";
import CustomDropdown from "../../components/CustomDropdown";
import CustomToggle from "../../components/CustomToggle";
import DeliveryPresenter from "../presenter/DeliveryPresenter";
import { setSelectedAddress, setSelectedPayment } from '../redux/deliverySlice';
import { PaiementOptions } from "../redux/utils";
// Interfaces
interface DropdownOption {
  label: string | JSX.Element;
  value: string;
  image?: string;
  price?: number;
}

// Main Component
export const NouvelleLivraison: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const deliveryState = useSelector((state: RootState) => state.delivery);  
  const [products, setProducts] = useState<DropdownOption[]>([]);
  const [clients, setClients] = useState<DropdownOption[]>([]);
  const [adresses, setAddress] = useState<DropdownOption[]>([]);
  const [defaultStatus, setDefaultStatus] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      const { products, clients, adresses, defaultStatus } = 
        await DeliveryPresenter.loadInitialData(dispatch);
      setProducts(products);
      setClients(clients);
      setAddress(adresses);
      setDefaultStatus(defaultStatus);
    };
    loadData();
  }, [dispatch]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouvelle livraison</Text>
      </View>
      <ScrollView>
        {/* Adresse Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Adresse de pickup</Text>
            <Text style={styles.sectionSubtitle}>(la même adresse de retour)</Text>
          </View>
          <CustomDropdown
  placeholder="Sélectionnez une adresse"
  options={[
    {
      label: (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Icon name="plus-circle" size={18} color="blue" style={{ marginRight: 8 }} />
          <Text>Ajouter une nouvelle adresse</Text>
        </View>
      ),
      value: "new_adresse",
    },
    ...adresses.map((adresse) => ({
      label: adresse.label,
      value: adresse.value,
    })),
  ]}
  onSelect={(value) => {
    if (value === "new_adresse") {
      navigation.navigate("AjoutAdress");
    } else {
      dispatch(setSelectedAddress(value));
    }
  }}
  selectedValue={deliveryState.selectedAddress}
/>

        </View>

        {/* Toggle Section */}
        <View style={styles.toggleSection}>
          <CustomToggle 
            isEnabled={deliveryState.isExchange} 
            onToggle={() => DeliveryPresenter.handleToggleExchange(dispatch, deliveryState.isExchange)} 
            label="C'est un Échange" 
          />
          <CustomToggle 
            isEnabled={deliveryState.isFragile} 
            onToggle={() => DeliveryPresenter.handleToggleFragile(dispatch, deliveryState.isFragile)} 
            label="Colis Fragile" 
          />
        </View>

        {/* Client Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ajouter un client</Text>
          <Text style={styles.description}>
            Saisissez le nom, l'adresse ou le numéro de téléphone pour localiser le profil recherché.
          </Text>
          <CustomDropdown
            placeholder="Sélectionnez un client"
            options={[
              {
                label: (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Icon name="plus-circle" size={18} color="blue" style={{ marginRight: 8 }} />
                    <Text>Ajouter un nouveau client</Text>
                  </View>
                ),
                value: "new_client",
              },
              ...clients.map((client) => ({
                label: client.label,
                value: client.value,
              })),
            ]}
            onSelect={(value) => 
              DeliveryPresenter.handleSelectClient(dispatch, value, navigation)
            }
            selectedValue={deliveryState.selectedClient}
          />
        </View>

        {/* Product Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ajouter un Produit</Text>
          <CustomDropdown
            placeholder="Sélectionnez un produit"
            options={[
              deliveryState.selectedProduct
                ? {
                    label: products.find((product) => product.value === deliveryState.selectedProduct)?.label,
                    value: deliveryState.selectedProduct,
                  }
                : { label: "Sélectionnez un produit", value: "" },
              {
                label: (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Icon name="plus-circle" size={18} color="blue" style={{ marginRight: 8 }} />
                    <Text>Ajouter un nouveau produit</Text>
                  </View>
                ),
                value: "new_product",
              },
              ...products.map((product) => ({
                label: (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {product.image && (
                      <Image
                        source={{ uri: product.image }}
                        style={{ width: 30, height: 30, borderRadius: 15, marginRight: 8 }}
                      />
                    )}
                    <Text style={{ flex: 1 }}>{product.label}</Text>
                  </View>
                ),
                value: product.value,
              })),
            ]}
            onSelect={(value) => 
              DeliveryPresenter.handleSelectProduct(dispatch, value, products, navigation)
            }
            selectedValue={deliveryState.selectedProduct}
          />
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => 
                DeliveryPresenter.handleDecrementQuantity(dispatch, deliveryState.quantity)
              }
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <TextInput
  style={styles.quantityInput}
  placeholder="Quantité"
  keyboardType="numeric"
  value={deliveryState.quantity?.toString() ?? "1"} // Solution avec opérateur optionnel et coalescence null
  onChangeText={(text) => {
    const newQuantity = parseInt(text, 10) || 1;
    DeliveryPresenter.handleQuantityChange(dispatch, newQuantity);
  }}
/>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => 
                DeliveryPresenter.handleIncrementQuantity(dispatch, deliveryState.quantity)
              }
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paiement</Text>
          <CustomDropdown
            placeholder="Sélectionnez le statut du paiement"
            options={PaiementOptions}
            onSelect={(value) => dispatch(setSelectedPayment(value))}
            selectedValue={deliveryState.selectedPayment}
          />
        </View>
        <View style={styles.separator1} />
        <Text style={styles.totalAmountText}>Total: {deliveryState.totalAmount} DT</Text>

        {/* Terms Section */}
        <View style={styles.termsSection}>
          <CustomCheckbox
            checked={deliveryState.termsAccepted}
            onToggle={() => DeliveryPresenter.handleTermsAccepted(dispatch, deliveryState.termsAccepted)}
            label="Je reconnais que le colis ne contient aucun matériel illégal ou dangereux."
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={styles.saveButton} 
          activeOpacity={0.8} 
          onPress={() => DeliveryPresenter.handleSaveDelivery(deliveryState, navigation, dispatch)}
        >
          <Text style={styles.saveButtonText}>Sauvegarder</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F7F7F7",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  backButton: {
    width: 46,
    height: 47,
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
  },
  sectionTitle: {
    color: "#27251F",
    fontSize: 13,
    fontFamily: "Avenir",
    fontWeight: "500",
    marginBottom: 18,
  },
  sectionSubtitle: {
    color: "#A7A9B7",
    fontSize: 9,
    fontFamily: "Avenir",
    marginLeft: 4,
    marginBottom: 18,
  },
  separator1: {
    height: 1,
    backgroundColor: "#574599",
    marginVertical: 18,
    marginBottom: 12,
  },
  description: {
    color: "#A7A9B7",
    fontSize: 9,
    fontFamily: "Avenir",
    marginBottom: 15,
  },
  toggleSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  toggleButton: {
    width: 30,
    height: 15,
  },
  toggle: {
    width: 30,
    height: 15,
    borderRadius: 7.6,
    justifyContent: "center",
  },
  knob: {
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
    elevation: 2,
    marginLeft: 1,
  },
  toggleLabel: {
    color: "#27251F",
    fontSize: 13,
    fontFamily: "Avenir",
  },
  dropdownContainer: {
    width: "100%",
  },
  dropdownButton: {
    height: 42,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#A7A9B7",
    backgroundColor: "#FFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1.8 },
    shadowOpacity: 0.16,
    shadowRadius: 3,
    elevation: 2,
  },
  headerTitle: {
    color: "#27251F",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
    flex: 1,
  },
  dropdownButtonText: {
    color: "#000",
    fontSize: 11,
    fontFamily: "Avenir",
  },
  dropdownArrow: {
    color: "#574599",
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    maxHeight: "70%",
    backgroundColor: "white",
    borderRadius: 5,
    overflow: "hidden",
  },
  option: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },
  optionText: {
    fontSize: 11,
    color: "#27251F",
    fontFamily: "Avenir",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkbox: {
    width: 21,
    height: 21,
    borderRadius: 6.6,
    borderWidth: 1.7,
    borderColor: "#E1E1E2",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  checkedBox: {
    backgroundColor: "#574599",
    borderColor: "#574599",
  },
  checkmark: {
    color: "white",
    fontSize: 14,
  },
  checkboxLabel: {
    color: "#27251F",
    fontSize: 9,
    fontFamily: "Avenir",
    maxWidth: 221,
  },
  termsSection: {
    marginVertical: 20,
  },
  saveButton: {
    width: 224,
    height: 37,
    borderRadius: 5.4,
    backgroundColor: "#574599",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginVertical: 20,
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontFamily: "Avenir",
    fontWeight: "800",
  },
  input: {
    height: 40,
    borderColor: "#A7A9B7",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  totalAmountText: {
    color: "#27251F",
    fontSize: 14,
    fontFamily: "Avenir",
    marginTop: 10,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginHorizontal: 80,

  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#574599",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  quantityInput: {
    flex: 1,
    height: 40,
    borderColor: "#A7A9B7",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 15,
    marginHorizontal: 10,
    textAlign: "center",
    
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#A7A9B7',
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: '#FFF',
  },
  picker: {
    height: 42,
    width: '100%',
  },
});

export default NouvelleLivraison;