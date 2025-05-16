import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput, Modal, FlatList, ScrollView, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Icon from " react-native-vector-icons/Feather";
import { NouvelleLivraisonPresenter } from "../presenter/NouvelleLivraisonPresenter";
import { CustomDropdown, CustomToggle, CustomCheckbox } from "../components";
import {styles } from "../../shared/styles/NouvelleLivraisonStyles";
import { DeliveryData, DropdownOption } from "../contracts/NouvelleLivraisonContracts";

const PaiementOptions = [
  { label: "Percevoir le paiement", value: "percevoir" },
  { label: "Payé", value: "payé" },
];

export const NouvelleLivraisonView: React.FC = () => {
  const navigation = useNavigation();
  const [presenter] = useState(new NouvelleLivraisonPresenter({
    setProducts: (products) => setProducts(products),
    setClients: (clients) => setClients(clients),
    setAddresses: (addresses) => setAddresses(addresses),
    setDefaultStatus: (status) => setDefaultStatus(status),
    showError: (message) => alert(message),
    showSuccess: (message) => alert(message),
    navigateBack: () => navigation.goBack(),
    navigateToScreen: (screen) => navigation.navigate(screen as never),
  }));

  const [isExchange, setIsExchange] = useState(false);
  const [isFragile, setIsFragile] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [products, setProducts] = useState<DropdownOption[]>([]);
  const [clients, setClients] = useState<DropdownOption[]>([]);
  const [addresses, setAddresses] = useState<DropdownOption[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    presenter.loadInitialData();
  }, []);

  const handleSave = async () => {
    if (!selectedAddress || !selectedClient || !selectedProduct || !selectedPayment) {
      presenter.showError("Please fill all required fields");
      return;
    }

    const deliveryData: DeliveryData = {
      id: presenter.generateDeliveryId(),
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
      qrCodeUrl: NouvelleLivraisonService.generateQRCode(deliveryData.id),
    };

    await presenter.saveDelivery(deliveryData);
  };

  return (
    <View style={styles.container}>
      {/* Header and form components */}
      {/* ... (same JSX as before) */}
    </View>
  );
};