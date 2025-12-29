import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Icon from "react-native-vector-icons/Feather";

import { CustomCheckbox } from "../components/CustomCheckbox";
import { CustomDropdown } from "../components/CustomDropdown";
import { CustomToggle } from "../components/CustomToggle";
import { NouvelleLivraisonPresenter } from "../presenters/NouvelleLivraisonPresenter";
import { DropdownOption } from "../types";

export const NouvelleLivraisonScreen: React.FC = () => {
  const navigation = useNavigation();
  const [presenter] = useState(new NouvelleLivraisonPresenter());
  const [isExchange, setIsExchange] = useState(false);
  const [isFragile, setIsFragile] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [products, setProducts] = useState<DropdownOption[]>([]);
  const [clients, setClients] = useState<DropdownOption[]>([]);
  const [adresses, setAddress] = useState<DropdownOption[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [productPrice, setProductPrice] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  const PaiementOptions = [
    { label: "Percevoir le paiement", value: "percevoir" },
    { label: "payé", value: "payé" },
  ];
const [selectedProducts, setSelectedProducts] = useState<Array<{
  productId: string;
  quantity: number;
  price: number;
}>>([]);
const removeProduct = (productId: string) => {
  setSelectedProducts(prevProducts => {
    const newProducts = prevProducts.filter(p => p.productId !== productId);
    
    // Recalculer le total
    const newTotal = newProducts.reduce((sum, product) => {
      return sum + (product.quantity * product.price);
    }, 0);
    setTotalAmount(newTotal);
    
    return newProducts;
  });
};

  useEffect(() => {
    const fetchData = async () => {
      const { products, clients, adresses, defaultStatus } = await presenter.fetchInitialData();
      setProducts(products);
      setClients(clients);
      setAddress(adresses);
      setDefaultStatus(defaultStatus);
    };
    fetchData();
  }, []);

  const saveDelivery = async () => {
    const { success, message } = await presenter.saveDelivery(
      selectedAddress,
      selectedClient,
      selectedProducts,
      selectedPayment,
      isExchange,
      isFragile,
      termsAccepted,
      quantity,
      totalAmount,
      defaultStatus
    );
    
    alert(message);
    if (success) {
      navigation.goBack();
    }
  };
  useEffect(() => {
  const newTotal = selectedProducts.reduce((sum, product) => {
    return sum + (product.quantity * product.price);
  }, 0);
  setTotalAmount(newTotal);
}, [selectedProducts]);
const addProduct = (productId: string, quantity: number, price: number) => {
  setSelectedProducts(prevProducts => {
    const existingProductIndex = prevProducts.findIndex(p => p.productId === productId);
    let newProducts;
    
    if (existingProductIndex >= 0) {
      // Mise à jour de la quantité si le produit existe déjà
      newProducts = [...prevProducts];
      newProducts[existingProductIndex].quantity = quantity;
    } else {
      // Ajout d'un nouveau produit
      newProducts = [...prevProducts, { productId, quantity, price }];
    }

    // Calcul du nouveau total avec les produits mis à jour
    const newTotal = newProducts.reduce((sum, product) => {
      return sum + (product.quantity * product.price);
    }, 0);
    
    setTotalAmount(newTotal);
    return newProducts;
  });
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
                navigation.navigate("AjoutAdress" as never);
              } else {
                setSelectedAddress(value);
              }
            }}
            selectedValue={selectedAddress}
          />
        </View>

        <View style={styles.toggleSection}>
          <CustomToggle isEnabled={isExchange} onToggle={() => setIsExchange(!isExchange)} label="C'est un Échange" />
          <CustomToggle isEnabled={isFragile} onToggle={() => setIsFragile(!isFragile)} label="Colis Fragile" />
        </View>

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
            onSelect={(value) => {
              if (value === "new_client") {
                navigation.navigate("AjoutClient" as never);
              } else {
                setSelectedClient(value);
              }
            }}
            selectedValue={selectedClient}
          />
        </View>
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Ajouter des Produits</Text>
  
  {/* Liste des produits sélectionnés */}
{selectedProducts.map((item, index) => {
  const product = products.find(p => p.value === item.productId);
  return (
    <View key={index} style={styles.selectedProductItem}>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product?.label}</Text>
        <Text>Quantité: {item.quantity}</Text>
        <Text>Prix: {item.price * item.quantity} DT</Text>
      </View>
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => removeProduct(item.productId)}
      >
        <Ionicons name="trash-outline" size={20} color="red" />
      </TouchableOpacity>
    </View>
  );
  
  <CustomDropdown
    placeholder="Ajouter un produit"
    options={[
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
    onSelect={(value) => {
      if (value === "new_product") {
        navigation.navigate("AjoutProd" as never);
      } else {
        const selectedProductData = products.find((product) => product.value === value);
        if (selectedProductData) {
          addProduct(value, 1, selectedProductData.price || 0);
        }
      }
    }}
  />
</View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paiement</Text>
          <CustomDropdown
            placeholder="Sélectionnez le statut du paiement"
            options={PaiementOptions}
            onSelect={(value) => setSelectedPayment(value)}
            selectedValue={selectedPayment}
          />
        </View>
        <View style={styles.separator1} />
        <Text style={styles.totalAmountText}>Total: {totalAmount} DT</Text>

        <View style={styles.termsSection}>
          <CustomCheckbox
            checked={termsAccepted}
            onToggle={() => setTermsAccepted(!termsAccepted)}
            label="Je reconnais que le colis ne contient aucun matériel illégal ou dangereux."
          />
        </View>

        <TouchableOpacity style={styles.saveButton} activeOpacity={0.8} onPress={saveDelivery}>
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
  headerTitle: {
    color: "#27251F",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
    flex: 1,
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
  selectedProductItem: {
  padding: 10,
  marginVertical: 5,
  backgroundColor: '#f0f0f0',
  borderRadius: 5,
},
selectedProductItem: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: 10,
  marginVertical: 5,
  backgroundColor: '#f0f0f0',
  borderRadius: 5,
},
productInfo: {
  flex: 1,
},
productName: {
  fontWeight: 'bold',
  marginBottom: 4,
},
removeButton: {
  padding: 8,
  marginLeft: 10,
},
});
export default NouvelleLivraisonScreen;