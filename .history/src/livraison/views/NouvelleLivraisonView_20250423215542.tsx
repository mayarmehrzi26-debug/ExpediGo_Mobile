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
import { PaiementOptions } from "./utils";

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
            onSelect={(value) => 
              DeliveryPresenter.handleSelectAddress(dispatch, value, navigation)
            }
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
              value={deliveryState.quantity.toString()}
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

// Styles (identique à votre code original)
const styles = StyleSheet.create({
  // ... (tous vos styles existants)
});

export default NouvelleLivraison;