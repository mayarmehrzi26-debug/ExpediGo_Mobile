import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Image 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/Feather";
import { 
  fetchProducts, 
  fetchClients, 
  fetchAdresses, 
  fetchDefaultStatus, 
  saveDelivery, 
  generateQRCode,
  DropdownOption 
} from "../models/Livraison";
import { CustomDropdown } from "../../CustomDropdown";
import { CustomToggle } from "./CustomToggle";
import { CustomCheckbox } from "./CustomCheckbox";
import { styles } from "./NouvelleLivraisonStyles";

const PaiementOptions = [
  { label: "Percevoir le paiement", value: "percevoir" },
  { label: "payé", value: "payé" },
];

export const NouvelleLivraisonPresenter: React.FC = () => {
  const navigation = useNavigation();
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

  useEffect(() => {
    const loadData = async () => {
      setProducts(await fetchProducts());
      setClients(await fetchClients());
      setAddress(await fetchAdresses());
      setDefaultStatus(await fetchDefaultStatus());
    };
    loadData();
  }, []);

  const handleSaveDelivery = async () => {
    if (!selectedAddress || !selectedClient || !selectedProduct || !selectedPayment) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    try {
      const newId = Math.floor(Math.random() * 1000000).toString();
      const qrCodeUrl = generateQRCode(newId);

      const deliveryData = {
        id: newId,
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
        status: defaultStatus,
        qrCodeUrl,
      };

      await saveDelivery(deliveryData);
      alert("Livraison enregistrée avec succès !");
      navigation.goBack();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement : ", error);
      alert("Une erreur s'est produite lors de l'enregistrement.");
    }
  };

  const handleProductSelect = (value: string) => {
    if (value === "new_product") {
      navigation.navigate("AjoutProd" as never);
    } else {
      setSelectedProduct(value);
      const selectedProductData = products.find((product) => product.value === value);
      if (selectedProductData) {
        setProductPrice(selectedProductData.price || 0);
        setTotalAmount(quantity * (selectedProductData.price || 0));
      }
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
        {/* Reste du JSX reste exactement le même */}
        {/* ... */}
      </ScrollView>
    </View>
  );
};