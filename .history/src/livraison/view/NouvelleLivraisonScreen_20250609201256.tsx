import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Array<{
    productId: string;
    quantity: number;
    price: number;
    name: string;
    image?: string;
  }>>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [quantityModalVisible, setQuantityModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<{
    productId: string;
    price: number;
    name: string;
    image?: string;
  } | null>(null);
  const [currentQuantity, setCurrentQuantity] = useState(1);

  const PaiementOptions = [
    { label: "Percevoir le paiement", value: "percevoir" },
    { label: "payé", value: "payé" },
  ];

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

  useEffect(() => {
    calculateTotalAmount();
  }, [selectedProducts]);

  const calculateTotalAmount = () => {
    const total = selectedProducts.reduce(
      (sum, product) => sum + product.quantity * product.price,
      0
    );
    setTotalAmount(total);
  };

  const openQuantityModal = (product: DropdownOption) => {
    setCurrentProduct({
      productId: product.value,
      price: product.price || 0,
      name: product.label,
      image: product.image
    });
    setCurrentQuantity(1);
    setQuantityModalVisible(true);
  };

  const addProductWithQuantity = () => {
    if (!currentProduct) return;

    const existingProductIndex = selectedProducts.findIndex(
      (p) => p.productId === currentProduct.productId
    );

    if (existingProductIndex >= 0) {
      const updatedProducts = [...selectedProducts];
      updatedProducts[existingProductIndex].quantity = currentQuantity;
      setSelectedProducts(updatedProducts);
    } else {
      setSelectedProducts([
        ...selectedProducts,
        {
          productId: currentProduct.productId,
          quantity: currentQuantity,
          price: currentProduct.price,
          name: currentProduct.name,
          image: currentProduct.image
        }
      ]);
    }

    setQuantityModalVisible(false);
  };

  const removeProduct = (productId: string) => {
    Alert.alert(
      "Supprimer le produit",
      "Êtes-vous sûr de vouloir supprimer ce produit ?",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        { 
          text: "Supprimer", 
          onPress: () => {
            setSelectedProducts(selectedProducts.filter(
              (p) => p.productId !== productId
            ));
          }
        }
      ]
    );
  };

  const saveDelivery = async () => {
    if (!selectedAddress || !selectedClient || !selectedPayment) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (selectedProducts.length === 0) {
      Alert.alert("Erreur", "Veuillez ajouter au moins un produit");
      return;
    }

    const { success, message } = await presenter.saveDelivery(
      selectedAddress,
      selectedClient,
      selectedProducts,
      selectedPayment,
      isExchange,
      isFragile,
      termsAccepted,
      totalAmount,
      defaultStatus
    );
    
    Alert.alert(success ? "Succès" : "Erreur", message);
    if (success) {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouvelle livraison</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
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
          
          <CustomDropdown
            placeholder="Sélectionnez un produit"
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
                    <Text style={{ flex: 1 }}>{product.label} - {product.price} DT</Text>
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
                  openQuantityModal(selectedProductData);
                }
              }
            }}
            selectedValue={null}
          />

          {/* Liste des produits sélectionnés */}
          <View style={styles.selectedProductsContainer}>
            {selectedProducts.map((product) => (
              <View key={product.productId} style={styles.selectedProductItem}>
                <View style={styles.productInfo}>
                  {product.image && (
                    <Image
                      source={{ uri: product.image }}
                      style={styles.productImage}
                    />
                  )}
                  <View style={styles.productTextContainer}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productDetails}>
                      {product.quantity} x {product.price} DT = {product.quantity * product.price} DT
                    </Text>
                  </View>
                </View>
                <TouchableOpacity 
                  onPress={() => removeProduct(product.productId)}
                  style={styles.removeProductButton}
                >
                  <Ionicons name="trash-outline" size={20} color="red" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
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

        <View style={styles.separator} />
        <Text style={styles.totalAmountText}>Total: {totalAmount.toFixed(3)} DT</Text>

        <View style={styles.termsSection}>
          <CustomCheckbox
            checked={termsAccepted}
            onToggle={() => setTermsAccepted(!termsAccepted)}
            label="Je reconnais que le colis ne contient aucun matériel illégal ou dangereux."
          />
        </View>

        <TouchableOpacity 
          style={styles.saveButton} 
          activeOpacity={0.8} 
          onPress={saveDelivery}
          disabled={!termsAccepted}
        >
          <Text style={styles.saveButtonText}>Sauvegarder</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal pour la quantité */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={quantityModalVisible}
        onRequestClose={() => setQuantityModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Quantité pour {currentProduct?.name}</Text>
            <Text style={styles.modalPrice}>Prix unitaire: {currentProduct?.price} DT</Text>
            
            <View style={styles.quantityModalControls}>
              <TouchableOpacity
                style={styles.quantityModalButton}
                onPress={() => setCurrentQuantity(Math.max(1, currentQuantity - 1))}
              >
                <Ionicons name="remove" size={24} color="white" />
              </TouchableOpacity>
              
              <TextInput
                style={styles.quantityModalInput}
                keyboardType="numeric"
                value={currentQuantity.toString()}
                onChangeText={(text) => {
                  const num = parseInt(text) || 1;
                  setCurrentQuantity(Math.max(1, num));
                }}
              />
              
              <TouchableOpacity
                style={styles.quantityModalButton}
                onPress={() => setCurrentQuantity(currentQuantity + 1)}
              >
                <Ionicons name="add" size={24} color="white" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalTotal}>
              Total: {(currentQuantity * (currentProduct?.price || 0)).toFixed(3)} DT
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setQuantityModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={addProductWithQuantity}
              >
                <Text style={styles.modalButtonText}>Confirmer</Text>
              </TouchableOpacity>
            </View>
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
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  section: {
    marginBottom: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#888",
    marginLeft: 8,
  },
  description: {
    fontSize: 12,
    color: "#888",
    marginBottom: 12,
  },
  toggleSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    elevation: 2,
  },
  separator: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 16,
  },
  totalAmountText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "right",
    marginBottom: 20,
    color: "#574599",
  },
  selectedProductsContainer: {
    marginTop: 16,
  },
  selectedProductItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  productInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  productImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  productTextContainer: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
  },
  productDetails: {
    fontSize: 12,
    color: "#666",
  },
  removeProductButton: {
    padding: 8,
  },
  termsSection: {
    marginVertical: 16,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    elevation: 2,
  },
  saveButton: {
    backgroundColor: "#574599",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  modalPrice: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#574599",
  },
  quantityModalControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  quantityModalButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#574599",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityModalInput: {
    width: 60,
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    textAlign: "center",
    marginHorizontal: 10,
    fontSize: 18,
  },
  modalTotal: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
    color: "#333",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#ccc",
  },
  confirmButton: {
    backgroundColor: "#574599",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default NouvelleLivraisonScreen;