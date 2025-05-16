import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  FlatList,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/Feather";
import { DeliveryPresenter } from "../presenters/DeliveryPresenter";
import CustomDropdown from "../components/CustomDropdown";
import CustomToggle from "../components/CustomToggle";
import CustomCheckbox from "../components/CustomCheckbox";
import { RootState } from "../redux/store";

const NouvelleLivraisonView: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [presenter] = useState(new DeliveryPresenter({
    setProducts,
    setClients,
    setAddresses,
    showError,
    showSuccess,
    navigateBack: () => navigation.goBack(),
  }));

  const [isExchange, setIsExchange] = useState(false);
  const [isFragile, setIsFragile] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [productPrice, setProductPrice] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  const products = useSelector((state: RootState) => state.product.products);
  const clients = useSelector((state: RootState) => state.client.clients);
  const addresses = useSelector((state: RootState) => state.address.addresses);

  const PaiementOptions = [
    { label: "Percevoir le paiement", value: "percevoir" },
    { label: "payé", value: "payé" },
  ];

  useEffect(() => {
    presenter.fetchProducts();
    presenter.fetchClients();
    presenter.fetchAddresses();
  }, []);

  const handleSaveDelivery = () => {
    if (!selectedAddress || !selectedClient || !selectedProduct || !selectedPayment) {
      showError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const delivery = {
      id: Math.floor(Math.random() * 1000000).toString(),
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
      status: "En attente",
      qrCodeUrl: DeliveryService.generateQRCode(id),
    };

    presenter.saveDelivery(delivery);
  };

  // ... (rest of the view code, similar to original but using presenter and redux)

  return (
    <View style={styles.container}>
      {/* ... (same JSX structure as original) */}
    </View>
  );
};

const styles = StyleSheet.create({
  // ... (same styles as original)
});

export default NouvelleLivraisonView;