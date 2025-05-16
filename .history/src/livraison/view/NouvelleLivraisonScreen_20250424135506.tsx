import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import CustomCheckbox from "../../components/CustomCheckbox";
import CustomDropdown from "../../components/CustomDropdown";
import { DropdownOption } from "../models/DropdownOption";
import { generateQRCode, getDropdownOptions, saveNewDelivery } from "../presenters/NouvelleLivraisonPresenter";

const NouvelleLivraisonScreen = () => {
  const navigation = useNavigation();
  const [clients, setClients] = useState<DropdownOption[]>([]);
  const [products, setProducts] = useState<DropdownOption[]>([]);
  const [addresses, setAddresses] = useState<DropdownOption[]>([]);
  const [status, setStatus] = useState<string>("");

  // States utilisateur
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [productPrice, setProductPrice] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [isFragile, setIsFragile] = useState<boolean>(false);
  const [isExchange, setIsExchange] = useState<boolean>(false);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);

  const paymentOptions = [
    { label: "Percevoir le paiement", value: "percevoir" },
    { label: "Payé", value: "payé" },
  ];

  useEffect(() => {
    getDropdownOptions("clients", "name").then(setClients);
    getDropdownOptions("products", "name", ["amount"]).then(options => {
      setProducts(options);
      // Initialiser le prix si un produit est déjà sélectionné
      if (selectedProduct) {
        const product = options.find(p => p.value === selectedProduct);
        if (product) setProductPrice(product.price || 0);
      }
    });
    getDropdownOptions("adresses", "address").then(setAddresses);
    getDropdownOptions("Status", "nomStat").then((s) => setStatus(s[0]?.label || ""));
  }, []);

  useEffect(() => {
    setTotalAmount(quantity * productPrice);
  }, [quantity, productPrice]);

  const handleSubmit = async () => {
    if (!selectedAddress || !selectedClient || !selectedProduct || !selectedPayment) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const id = Math.floor(Math.random() * 1000000).toString();
    const qrCodeUrl = generateQRCode(id);

    const livraison: Livraison = {
      id,
      address: selectedAddress,
      client: selectedClient,
      product: selectedProduct,
      payment: selectedPayment,
      isExchange,
      isFragile,
      termsAccepted,
      quantity,
      totalAmount,
      createdAt: new Date(),
      status,
      qrCodeUrl,
    };

    await saveNewDelivery(livraison);
    navigation.goBack();
  };

  const handleProductSelect = (value: string) => {
    setSelectedProduct(value);
    const product = products.find(p => p.value === value);
    if (product) {
      setProductPrice(product.price || 0);
      setTotalAmount(quantity * (product.price || 0));
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
                    <Ionicons name="add-circle-outline" size={18} color="blue" style={{ marginRight: 8 }} />
                    <Text>Ajouter une nouvelle adresse</Text>
                  </View>
                ),
                value: "new_address",
              },
              ...addresses,
            ]}
            onSelect={(value) => {
              if (value === "new_address") {
                navigation.navigate("AjoutAdress" as never);
              } else {
                setSelectedAddress(value);
              }
            }}
            selectedValue={selectedAddress}
          />
        </View>

        {/* Toggle Section */}
        <View style={styles.toggleSection}>
          <CustomCheckbox 
            label="C'est un Échange" 
            value={isExchange} 
            onChange={() => setIsExchange(!isExchange)} 
          />
          <CustomCheckbox 
            label="Colis Fragile" 
            value={isFragile} 
            onChange={() => setIsFragile(!isFragile)} 
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
                    <Ionicons name="add-circle-outline" size={18} color="blue" style={{ marginRight: 8 }} />
                    <Text>Ajouter un nouveau client</Text>
                  </View>
                ),
                value: "new_client",
              },
              ...clients,
            ]}
            onSelect={(value) => {
              if (value === "new_client") {
                navigation.navigate("AjoutClientView" as never);
              } else {
                setSelectedClient(value);
              }
            }}
            selectedValue={selectedClient}
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
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="add-circle-outline" size={18} color="blue" style={{ marginRight: 8 }} />
                    <Text>Ajouter un nouveau produit</Text>
                  </View>
                ),
                value: "new_product",
              },
              ...products.map(product => ({
                ...product,
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
                )
              }))
            ]}
            onSelect={(value) => {
              if (value === "new_product") {
                navigation.navigate("AjoutProd" as never);
              } else {
                handleProductSelect(value);
              }
            }}
            selectedValue={selectedProduct}
          />
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => {
                const newQuantity = Math.max(1, quantity - 1);
                setQuantity(newQuantity);
              }}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.quantityInput}
              keyboardType="numeric"
              value={quantity.toString()}
              onChangeText={(text) => {
                const newQuantity = parseInt(text, 10) || 1;
                setQuantity(newQuantity);
              }}
            />
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => {
                const newQuantity = quantity + 1;
                setQuantity(newQuantity);
              }}
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
            onSelect={setSelectedPayment}
            selectedValue={selectedPayment}
          />
        </View>

        <View style={styles.separator} />
        <Text style={styles.totalAmountText}>Total: {totalAmount} DT</Text>

        {/* Terms Section */}
        <View style={styles.termsSection}>
          <CustomCheckbox
            label="Je reconnais que le colis ne contient aucun matériel illégal ou dangereux."
            value={termsAccepted}
            onChange={() => setTermsAccepted(!termsAccepted)}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
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
    marginBottom: 20,
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
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
  },
  sectionTitle: {
    color: "#27251F",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 8,
  },
  sectionSubtitle: {
    color: "#A7A9B7",
    fontSize: 9,
    marginLeft: 4,
    marginBottom: 8,
  },
  description: {
    color: "#A7A9B7",
    fontSize: 9,
    marginBottom: 15,
  },
  toggleSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  separator: {
    height: 1,
    backgroundColor: "#574599",
    marginVertical: 18,
    marginBottom: 12,
  },
  totalAmountText: {
    color: "#27251F",
    fontSize: 14,
    marginVertical: 10,
    textAlign: "right",
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
    fontWeight: "800",
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
});

export default NouvelleLivraisonScreen;