import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { addDoc, collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { firebasestore } from "../FirebaseConfig";

// Interfaces
interface DropdownOption {
  label: string | JSX.Element; // Permet d'accepter du texte ou du JSX
  value: string;
  image?: string; // Optionnel : URL de l'image du produit
}

interface CustomDropdownProps {
  options?: DropdownOption[];
  placeholder: string;
  onSelect: (value: string) => void;
  selectedValue?: string;
}

interface CustomCheckboxProps {
  checked: boolean;
  onToggle: () => void;
  label?: string;
}

interface CustomToggleProps {
  isEnabled: boolean;
  onToggle: () => void;
  label: string;
}

// Main Component
export const NouvelleLivraison: React.FC = () => {
  const navigation = useNavigation();
  const [isExchange, setIsExchange] = useState(false);
  const [isFragile, setIsFragile] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [products, setProducts] = useState<DropdownOption[]>([]);
  const [clients, setClients] = useState<DropdownOption[]>([]);
  const [adresses, setAdresses] = useState<DropdownOption[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

  const PaiementOptions = [
    { label: "Percevoir le paiement", value: "percevoir" },
    { label: "payé", value: "payé" },
  ];

  // Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(firebasestore, "products"));
      const productOptions = querySnapshot.docs.map((doc) => ({
        label: doc.data().name, // Assurez-vous que c'est bien une chaîne de caractères
        value: doc.id,
        image: doc.data().imageUrl, // URL de l'image du produit
      }));
      setProducts(productOptions);
    };

    fetchProducts();
  }, []);

  // Fetch Clients
  useEffect(() => {
    const fetchClients = async () => {
      const querySnapshot = await getDocs(collection(firebasestore, "clients"));
      const clientOptions = querySnapshot.docs.map((doc) => ({
        label: doc.data().name,
        value: doc.id,
      }));
      setClients(clientOptions);
    };

    fetchClients();
  }, []);

  // Fetch Adresses
  useEffect(() => {
    const fetchAdresses = async () => {
      const querySnapshot = await getDocs(collection(firebasestore, "adresses"));
      const adresseOptions = querySnapshot.docs.map((doc) => ({
        label: doc.data().address,
        value: doc.id,
      }));
      setAdresses(adresseOptions);
    };

    fetchAdresses();
  }, []);

  // Save Delivery Function
  const saveDelivery = async () => {
    if (!selectedAddress || !selectedClient || !selectedProduct || !selectedPayment) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const deliveryData = {
      address: selectedAddress,
      client: selectedClient,
      product: selectedProduct,
      payment: selectedPayment,
      isExchange,
      isFragile,
      termsAccepted,
      createdAt: new Date(),
    };

    try {
      await addDoc(collection(firebasestore, "livraisons"), deliveryData);
      alert("Livraison enregistrée avec succès !");
      navigation.goBack();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la livraison : ", error);
      alert("Une erreur s'est produite lors de l'enregistrement de la livraison.");
    }
  };

  // Custom Toggle Component
  const CustomToggle: React.FC<CustomToggleProps> = ({ isEnabled, onToggle, label }) => {
    const position = new Animated.Value(isEnabled ? 1 : 0);

    useEffect(() => {
      Animated.spring(position, {
        toValue: isEnabled ? 1 : 0,
        useNativeDriver: false,
      }).start();
    }, [isEnabled]);

    return (
      <View style={styles.toggleContainer}>
        <TouchableOpacity activeOpacity={0.8} onPress={onToggle} style={styles.toggleButton}>
          <Animated.View
            style={[
              styles.toggle,
              {
                backgroundColor: position.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["#D1D1D6", "#54E598"],
                }),
              },
            ]}
          >
            <Animated.View
              style={[
                styles.knob,
                {
                  transform: [
                    {
                      translateX: position.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 15],
                      }),
                    },
                  ],
                },
              ]}
            />
          </Animated.View>
        </TouchableOpacity>
        <Text style={styles.toggleLabel}>{label}</Text>
      </View>
    );
  };

  // Custom Dropdown Component
  const CustomDropdown: React.FC<CustomDropdownProps> = ({ options = [], placeholder, onSelect, selectedValue }) => {
    const [visible, setVisible] = useState(false);

    // Trouver le libellé correspondant à la valeur sélectionnée
    const selectedLabel = options.find((option) => option.value === selectedValue)?.label || placeholder;

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

  // Custom Checkbox Component
  const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ checked, onToggle, label }) => {
    return (
      <TouchableOpacity style={styles.checkboxContainer} onPress={onToggle} activeOpacity={0.8}>
        <View style={[styles.checkbox, checked && styles.checkedBox]}>
          {checked && <Text style={styles.checkmark}>✓</Text>}
        </View>
        {label && <Text style={styles.checkboxLabel}>{label}</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Votre contenu JSX ici */}
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
    paddingTop: 31,
    paddingBottom: 14,
  },
  backButton: {
    width: 46,
    height: 47,
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 28,
  },
  sectionTitle: {
    color: "#27251F",
    fontSize: 13,
    fontFamily: "Avenir",
    fontWeight: "500",
    marginBottom: 28,
  },
  sectionSubtitle: {
    color: "#A7A9B7",
    fontSize: 9,
    fontFamily: "Avenir",
    marginLeft: 4,
    marginBottom: 28,
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
    color: "#000", // Couleur noire pour une meilleure visibilité
    fontSize: 11,
    fontFamily: "Avenir",
  },
  dropdownArrow: {
    color: "#FD5A1E",
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
    backgroundColor: "#54E598",
    borderColor: "#54E598",
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
    backgroundColor: "#54E598",
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
});

export default NouvelleLivraison;