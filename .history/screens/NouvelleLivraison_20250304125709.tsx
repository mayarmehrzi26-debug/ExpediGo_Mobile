import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { collection, getDocs } from "firebase/firestore";
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

  const PaiementOptions = [
    { label: "Service commercial", value: "commercial" },
    { label: "Service technique", value: "technique" },
  ];

  // Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(firebasestore, "products"));
      const productOptions = querySnapshot.docs.map((doc) => ({
        label: doc.data().name,
        value: doc.id, // Utilise l'ID du produit comme valeur
        image: doc.data().imageUrl, // Assurez-vous que chaque produit a une propriété 'image'
      }));
      setProducts(productOptions);
    };

    fetchProducts();
  }, []);
  useEffect(() => {
    const fetchClients = async () => {
      const querySnapshot = await getDocs(collection(firebasestore, "clients"));
      const clientOptions = querySnapshot.docs.map((doc) => ({
        label: doc.data().name,
        value: doc.id, // Utilise l'ID du produit comme valeur
      }));
      setClients(clientOptions);
    };

    fetchClients();
  }, []);


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

    return (
      <View style={styles.dropdownContainer}>
        <TouchableOpacity style={styles.dropdownButton} onPress={() => setVisible(true)} activeOpacity={0.8}>
          <Text style={styles.dropdownButtonText}>{selectedValue || placeholder}</Text>
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
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouvelle livraison</Text>
      </View>

      {/* Pickup Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Adresse de pickup</Text>
          <Text style={styles.sectionSubtitle}>(la même adresse de retour)</Text>
        </View>
        <CustomDropdown placeholder="Sélectionnez une adresse" onSelect={() => {}} />
      </View>

      {/* Toggle Section */}
      <View style={styles.toggleSection}>
        <CustomToggle isEnabled={isExchange} onToggle={() => setIsExchange(!isExchange)} label="C'est un Échange" />
        <CustomToggle isEnabled={isFragile} onToggle={() => setIsFragile(!isFragile)} label="Colis Fragile" />
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
          <Icon name="plus-circle" size={18} color="blue" style={{ marginRight: 8 }} />
          <Text>Ajouter un nouveau client</Text>
        </View>
      ),
      value: "new_client",
    },
    ...clients.map((client) => ({
      label: (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
         
          <Text style={{ flex: 1 }}>{client.label}</Text>
        </View>
      ),
      value: client.value,
    })),
  ]}
  onSelect={(value) => {
    if (value === "new_client") {
      navigation.navigate("AjoutClient" as never); // Correction de la navigation
    }
  }}
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
          <Icon name="plus-circle" size={18} color="blue" style={{ marginRight: 8 }} />
          <Text>Ajouter un nouveau produit</Text>
        </View>
      ),
      value: "new_product",
    },
    ...products.map((product) => ({
      label: (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {/* Image on the left */}
          {product.image && (
            <Image
              source={{ uri: product.image }}
              style={{
                width: 30,
                height: 30,
                borderRadius: 15, // Make image rounded
                marginRight: 8, // Space between image and text
              }}
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
      navigation.navigate("AjoutProd" as never); // Correction de la navigation
    }
  }}
/>

      </View>

      {/* Payment Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Paiement</Text>
        <CustomDropdown placeholder="Sélectionnez le statut du paiement" options={PaiementOptions} onSelect={() => {}} />
      </View>

      {/* Terms Section */}
      <View style={styles.termsSection}>
        <CustomCheckbox
          checked={termsAccepted}
          onToggle={() => setTermsAccepted(!termsAccepted)}
          label="Je reconnais que le colis ne contient aucun matériel illégal ou dangereux."
        />
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} activeOpacity={0.8} onPress={() => {}}>
        <Text style={styles.saveButtonText}>Sauvegarder</Text>
      </TouchableOpacity>
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
    color: "#A7A9B7",
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