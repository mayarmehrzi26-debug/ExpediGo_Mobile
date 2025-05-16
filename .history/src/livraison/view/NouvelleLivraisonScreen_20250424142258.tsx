import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import CustomCheckbox from "../../components/CustomCheckbox";
import CustomDropdown from "../../components/CustomDropdown";
import { DropdownOption } from "../models/DropdownOption";
import { Livraison } from "../models/Livraison";
import { LivraisonPresenter } from "../presenters/LivraisonPresenter";

const NouvelleLivraisonView = () => {
  const navigation = useNavigation();
  
  // States pour les données
  const [clients, setClients] = useState<DropdownOption[]>([]);
  const [products, setProducts] = useState<DropdownOption[]>([]);
  const [addresses, setAddresses] = useState<DropdownOption[]>([]);
  const [status, setStatus] = useState<string>("pending");

  // States du formulaire
  const [formData, setFormData] = useState<Omit<Livraison, 'id' | 'qrCodeUrl' | 'createdAt'>>({
    address: "",
    client: "",
    product: "",
    payment: "",
    isExchange: false,
    isFragile: false,
    termsAccepted: false,
    quantity: 1,
    totalAmount: 0,
    status: "pending"
  });

  const [loading, setLoading] = useState(false);

  // Options statiques
  const paymentOptions = [
    { label: "Percevoir le paiement", value: "collect" },
    { label: "Payé", value: "paid" },
  ];

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        const [clientsData, productsData, addressesData] = await Promise.all([
          LivraisonPresenter.getDropdownOptions('clients', 'name'),
          LivraisonPresenter.getDropdownOptions('products', 'name', ['price']),
          LivraisonPresenter.getDropdownOptions('addresses', 'fullAddress')
        ]);

        setClients(clientsData);
        setProducts(productsData);
        setAddresses(addressesData);
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    // Calcul du montant total quand la quantité ou le produit change
    if (formData.product) {
      const selectedProduct = products.find(p => p.value === formData.product);
      const price = selectedProduct?.price || 0;
      const newTotal = price * formData.quantity;
      setFormData(prev => ({ ...prev, totalAmount: newTotal }));
    }
  }, [formData.product, formData.quantity]);

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProductSelect = (value: string) => {
    if (value === "new_product") {
      navigation.navigate("AjoutProd" as never);
      return;
    }
    handleInputChange('product', value);
  };

  const handleClientSelect = (value: string) => {
    if (value === "new_client") {
      navigation.navigate("AjoutClientView" as never);
      return;
    }
    handleInputChange('client', value);
  };

  const handleAddressSelect = (value: string) => {
    if (value === "new_address") {
      navigation.navigate("AjoutAdress" as never);
      return;
    }
    handleInputChange('address', value);
  };

  const handleSubmit = async () => {
    if (!formData.address || !formData.client || !formData.product || !formData.payment || !formData.termsAccepted) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    try {
      setLoading(true);
      const newDelivery = await LivraisonPresenter.createNewDelivery(formData);
      console.log("Livraison créée:", newDelivery);
      navigation.goBack();
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      alert("Une erreur est survenue lors de la création de la livraison");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouvelle livraison</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
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
                  <View style={styles.addOption}>
                    <Ionicons name="add-circle-outline" size={18} color="blue" />
                    <Text>Ajouter une nouvelle adresse</Text>
                  </View>
                ),
                value: "new_address",
              },
              ...addresses,
            ]}
            onSelect={handleAddressSelect}
            selectedValue={formData.address}
            disabled={loading}
          />
        </View>

        {/* Toggle Section */}
        <View style={styles.toggleSection}>
          <CustomCheckbox 
            label="C'est un Échange" 
            value={formData.isExchange} 
            onChange={() => handleInputChange('isExchange', !formData.isExchange)}
            disabled={loading}
          />
          <CustomCheckbox 
            label="Colis Fragile" 
            value={formData.isFragile} 
            onChange={() => handleInputChange('isFragile', !formData.isFragile)}
            disabled={loading}
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
                  <View style={styles.addOption}>
                    <Ionicons name="add-circle-outline" size={18} color="blue" />
                    <Text>Ajouter un nouveau client</Text>
                  </View>
                ),
                value: "new_client",
              },
              ...clients,
            ]}
            onSelect={handleClientSelect}
            selectedValue={formData.client}
            disabled={loading}
          />
        </View>

        {/* Product Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ajouter un Produit</Text>
          <CustomDropdown
            placeholder="Sélectionnez un produit"
            options={[
              {
                label: (
                  <View style={styles.addOption}>
                    <Ionicons name="add-circle-outline" size={18} color="blue" />
                    <Text>Ajouter un nouveau produit</Text>
                  </View>
                ),
                value: "new_product",
              },
              ...products.map(product => ({
                ...product,
                label: (
                  <View style={styles.productOption}>
                    {product.image && (
                      <Image
                        source={{ uri: product.image }}
                        style={styles.productImage}
                      />
                    )}
                    <Text style={styles.productLabel}>{product.label}</Text>
                    <Text style={styles.productPrice}>{product.price} DT</Text>
                  </View>
                )
              }))
            ]}
            onSelect={handleProductSelect}
            selectedValue={formData.product}
            disabled={loading}
          />
          
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={[styles.quantityButton, loading && styles.disabled]}
              onPress={() => handleInputChange('quantity', Math.max(1, formData.quantity - 1))}
              disabled={loading}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            
            <TextInput
              style={[styles.quantityInput, loading && styles.disabled]}
              keyboardType="numeric"
              value={formData.quantity.toString()}
              onChangeText={(text) => {
                const newQuantity = parseInt(text, 10) || 1;
                handleInputChange('quantity', newQuantity);
              }}
              editable={!loading}
            />
            
            <TouchableOpacity
              style={[styles.quantityButton, loading && styles.disabled]}
              onPress={() => handleInputChange('quantity', formData.quantity + 1)}
              disabled={loading}
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
            options={paymentOptions}
            onSelect={(value) => handleInputChange('payment', value)}
            selectedValue={formData.payment}
            disabled={loading}
          />
        </View>

        <View style={styles.separator} />
        <Text style={styles.totalAmountText}>Total: {formData.totalAmount} DT</Text>

        {/* Terms Section */}
        <View style={styles.termsSection}>
          <CustomCheckbox
            label="Je reconnais que le colis ne contient aucun matériel illégal ou dangereux."
            value={formData.termsAccepted}
            onChange={() => handleInputChange('termsAccepted', !formData.termsAccepted)}
            disabled={loading}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? "Création en cours..." : "Sauvegarder"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#27251F",
    flex: 1,
    textAlign: "center",
  },
  section: {
    marginBottom: 25,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#27251F",
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#A7A9B7",
    marginLeft: 5,
  },
  description: {
    fontSize: 12,
    color: "#A7A9B7",
    marginBottom: 15,
  },
  toggleSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  separator: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 20,
  },
  totalAmountText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#574599",
    textAlign: "right",
    marginBottom: 20,
  },
  termsSection: {
    marginBottom: 25,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  saveButton: {
    backgroundColor: "#574599",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#cccccc",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
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
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  quantityInput: {
    width: 60,
    height: 40,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    marginHorizontal: 10,
    textAlign: "center",
    fontSize: 16,
  },
  addOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
  },
  productOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  productImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  productLabel: {
    flex: 1,
    fontSize: 14,
  },
  productPrice: {
    fontWeight: "bold",
    color: "#574599",
    marginLeft: 10,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default NouvelleLivraisonView;