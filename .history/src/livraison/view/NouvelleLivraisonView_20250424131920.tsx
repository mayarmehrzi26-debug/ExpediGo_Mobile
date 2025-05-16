import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput, Modal, FlatList, ScrollView, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Icon from " react-native-vector-icons/Feather";
import { NouvelleLivraisonPresenter } from "../presenter/NouvelleLivraisonPresenter";
import { CustomDropdown, CustomToggle, CustomCheckbox } from "../..";
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
    <View style={styles.dropdownContainer}>
    <TouchableOpacity style={styles.dropdownButton} onPress={() => setVisible(true)} activeOpacity={0.8}>
      <Text style={styles.dropdownButtonText}>
        {typeof selectedLabel === "string" ? selectedLabel : placeholder}
      </Text>
      <Text style={styles.dropdownArrow}>▼</Text>
    </TouchableOpacity>

    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setVisible(false)}>
        <View style={styles.modalContent}>
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.option}
                onPress={() => {
                  onSelect(item.value);
                  setVisible(false);
                }}
              >
                {typeof item.label === "string" ? (
                  <Text style={styles.optionText}>{item.label}</Text>
                ) : (
                  item.label
                )}
                {item.image && (
                  <Image
                    source={{ uri: item.image }}
                    style={{ width: 30, height: 30, borderRadius: 5, marginLeft: 8 }}
                  />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  </View>
  );
};

// Styles
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
  });
  
