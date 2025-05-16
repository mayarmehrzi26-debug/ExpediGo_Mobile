import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useDispatch, useSelector } from "react-redux";
import CustomCheckbox from "../../components/CustomCheckbox";
import CustomToggle from "../../components/CustomToggle";
import DeliveryPresenter from "../presenter/DeliveryPresenter";
import { 
  setSelectedAddress, 
  setSelectedClient,
  setSelectedProduct,
  setSelectedPayment,
  setProductPrice
} from '../redux/deliverySlice';
import { PaiementOptions } from "../redux/utils";

interface DropdownOption {
  label: string;
  value: string;
  image?: string;
  price?: number;
}

export const NouvelleLivraison: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const deliveryState = useSelector((state: RootState) => state.delivery);
  
  const [products, setProducts] = useState<DropdownOption[]>([]);
  const [clients, setClients] = useState<DropdownOption[]>([]);
  const [adresses, setAddress] = useState<DropdownOption[]>([]);
  const [defaultStatus, setDefaultStatus] = useState<string | null>(null);

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
          
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={deliveryState.selectedAddress || ''}
              onValueChange={(value) => {
                if (value === "new_adresse") {
                  navigation.navigate("AjoutAdress");
                } else if (value) {
                  dispatch(setSelectedAddress(value));
                }
              }}
              style={styles.picker}
              dropdownIconColor="#574599"
            >
              <Picker.Item label="Sélectionnez une adresse" value="" enabled={false} />
              <Picker.Item 
                label="Ajouter une nouvelle adresse" 
                value="new_adresse" 
              />
              {adresses.map((adresse) => (
                <Picker.Item 
                  key={adresse.value} 
                  label={adresse.label} 
                  value={adresse.value} 
                />
              ))}
            </Picker>
          </View>
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
          
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={deliveryState.selectedClient || ''}
              onValueChange={(value) => {
                if (value === "new_client") {
                  navigation.navigate("AjoutClientView");
                } else if (value) {
                  dispatch(setSelectedClient(value));
                }
              }}
              style={styles.picker}
              dropdownIconColor="#574599"
            >
              <Picker.Item label="Sélectionnez un client" value="" enabled={false} />
              <Picker.Item 
                label="Ajouter un nouveau client" 
                value="new_client" 
              />
              {clients.map((client) => (
                <Picker.Item 
                  key={client.value} 
                  label={client.label} 
                  value={client.value} 
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Product Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ajouter un Produit</Text>
          
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={deliveryState.selectedProduct || ''}
              onValueChange={(value) => {
                if (value === "new_product") {
                  navigation.navigate("AjoutProd");
                } else if (value) {
                  dispatch(setSelectedProduct(value));
                  const selected = products.find(p => p.value === value);
                  if (selected) dispatch(setProductPrice(selected.price || 0));
                }
              }}
              style={styles.picker}
              dropdownIconColor="#574599"
            >
              <Picker.Item label="Sélectionnez un produit" value="" enabled={false} />
              <Picker.Item 
                label="Ajouter un nouveau produit" 
                value="new_product" 
              />
              {products.map((product) => (
                <Picker.Item 
                  key={product.value} 
                  label={product.label} 
                  value={product.value} 
                />
              ))}
            </Picker>
          </View>
          
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
              value={deliveryState.quantity?.toString() ?? "1"}
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
          
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={deliveryState.selectedPayment || ''}
              onValueChange={(value) => dispatch(setSelectedPayment(value))}
              style={styles.picker}
              dropdownIconColor="#574599"
            >
              <Picker.Item label="Sélectionnez le statut du paiement" value="" enabled={false} />
              {PaiementOptions.map((option) => (
                <Picker.Item 
                  key={option.value} 
                  label={option.label} 
                  value={option.value} 
                />
              ))}
            </Picker>
          </View>
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
  headerTitle: {
    color: "#27251F",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
    flex: 1,
  },
  section: {
    marginBottom: 15,
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
    marginBottom: 8,
  },
  sectionSubtitle: {
    color: "#A7A9B7",
    fontSize: 9,
    fontFamily: "Avenir",
    marginLeft: 4,
  },
  description: {
    color: "#A7A9B7",
    fontSize: 9,
    fontFamily: "Avenir",
    marginBottom: 10,
  },
  toggleSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  separator1: {
    height: 1,
    backgroundColor: "#574599",
    marginVertical: 15,
  },
  totalAmountText: {
    color: "#27251F",
    fontSize: 14,
    fontFamily: "Avenir",
    marginTop: 10,
    textAlign: 'center',
    fontWeight: 'bold'
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
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 15,
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
    marginBottom: 10,
    backgroundColor: '#FFF',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
});

export default NouvelleLivraison;