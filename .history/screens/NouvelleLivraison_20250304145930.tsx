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
  label: string | JSX.Element;
  value: string;
  image?: string;
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
  const [adresses, setAddress] = useState<DropdownOption[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<string>('');

  const PaiementOptions = [
    { label: "Percevoir le paiement", value: "percevoir" },
    { label: "payé", value: "payé" },
  ];

  // Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(firebasestore, "products"));
      const productOptions = querySnapshot.docs.map((doc) => ({
        label: doc.data().name,
        value: doc.id,
        image: doc.data().imageUrl,
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

  // Fetch Addresses
  useEffect(() => {
    const fetchAdresses = async () => {
      const querySnapshot = await getDocs(collection(firebasestore, "adresses"));
      const adresseOptions = querySnapshot.docs.map((doc) => ({
        label: doc.data().address,
        value: doc.id,
      }));
      setAddress(adresseOptions);
    };

    fetchAdresses();
  }, []);

  // Function to save delivery
  const saveDelivery = async () => {
    if (!selectedProduct || !selectedClient || !selectedAddress || !paymentStatus || !termsAccepted) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    try {
      const deliveryRef = collection(firebasestore, "livraisons");
      const newDelivery = {
        productId: selectedProduct,
        clientId: selectedClient,
        addressId: selectedAddress,
        paymentStatus: paymentStatus,
        isExchange: isExchange,
        isFragile: isFragile,
        termsAccepted: termsAccepted,
        timestamp: new Date(),
      };

      await addDoc(deliveryRef, newDelivery);
      alert("Livraison sauvegardée avec succès !");
      navigation.goBack();
    } catch (error) {
      console.error("Error saving delivery: ", error);
      alert("Une erreur est survenue lors de la sauvegarde.");
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
const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ checked, onToggle, label }) => {
  return (
    <View style={styles.checkboxContainer}>
      <TouchableOpacity onPress={onToggle} style={styles.checkbox}>
        {checked && <View style={styles.checkboxChecked} />}
      </TouchableOpacity>
      {label && <Text style={styles.checkboxLabel}>{label}</Text>}
    </View>
  );
};
Complete Updated Code:
Here’s your entire NouvelleLivraison component with the checkbox integrated:

tsx
Copy
Edit
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { collection, getDocs, addDoc } from "firebase/firestore";
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
  label: string | JSX.Element;
  value: string;
  image?: string;
}

interface CustomDropdownProps {
  options?: DropdownOption[];
  placeholder: string;
  onSelect: (value: string) => void;
  selectedValue?: string;
}

interface CustomToggleProps {
  isEnabled: boolean;
  onToggle: () => void;
  label: string;
}

interface CustomCheckboxProps {
  checked: boolean;
  onToggle: () => void;
  label?: string;
}

// Main Component
export const NouvelleLivraison: React.FC = () => {
  const navigation = useNavigation();
  const [isExchange, setIsExchange] = useState(false);
  const [isFragile, setIsFragile] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [products, setProducts] = useState<DropdownOption[]>([]);
  const [clients, setClients] = useState<DropdownOption[]>([]);
  const [adresses, setAddress] = useState<DropdownOption[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<string>('');

  const PaiementOptions = [
    { label: "Percevoir le paiement", value: "percevoir" },
    { label: "payé", value: "payé" },
  ];

  // Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(firebasestore, "products"));
      const productOptions = querySnapshot.docs.map((doc) => ({
        label: doc.data().name,
        value: doc.id,
        image: doc.data().imageUrl,
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

  // Fetch Addresses
  useEffect(() => {
    const fetchAdresses = async () => {
      const querySnapshot = await getDocs(collection(firebasestore, "adresses"));
      const adresseOptions = querySnapshot.docs.map((doc) => ({
        label: doc.data().address,
        value: doc.id,
      }));
      setAddress(adresseOptions);
    };

    fetchAdresses();
  }, []);

  // Function to save delivery
  const saveDelivery = async () => {
    if (!selectedProduct || !selectedClient || !selectedAddress || !paymentStatus || !termsAccepted) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    try {
      const deliveryRef = collection(firebasestore, "livraisons");
      const newDelivery = {
        productId: selectedProduct,
        clientId: selectedClient,
        addressId: selectedAddress,
        paymentStatus: paymentStatus,
        isExchange: isExchange,
        isFragile: isFragile,
        termsAccepted: termsAccepted,
        timestamp: new Date(),
      };

      await addDoc(deliveryRef, newDelivery);
      alert("Livraison sauvegardée avec succès !");
      navigation.goBack();
    } catch (error) {
      console.error("Error saving delivery: ", error);
      alert("Une erreur est survenue lors de la sauvegarde.");
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
              label: <Text>{adresse.label}</Text>,
              value: adresse.value,
            })),
          ]}
          onSelect={(value) => setSelectedAddress(value)}
        />
      </View>

      {/* Toggle Section */}
      <View style={styles.toggleSection}>
        <CustomToggle isEnabled={isExchange} onToggle={() => setIsExchange(!isExchange)} label="C'est un Échange" />
        <CustomToggle isEnabled={isFragile} onToggle={() => setIsFragile(!isFragile)} label="Colis Fragile" />
      </View>

      {/* Client Section */}
      <View style={styles.section}>
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
              label: <Text>{client.label}</Text>,
              value: client.value,
            })),
          ]}
          onSelect={(value) => setSelectedClient(value)}
        />
      </View>

      {/* Product Section */}
      <View style={styles.section}>
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
              label: <Text>{product.label}</Text>,
              value: product.value,
            })),
          ]}
          onSelect={(value) => setSelectedProduct(value)}
        />
      </View>

      {/* Payment Section */}
      <View style={styles.section}>
        <CustomDropdown
          placeholder="Sélectionnez le statut de paiement"
          options={PaiementOptions}
          onSelect={(value) => setPaymentStatus(value)}
        />
      </View>

      {/* Terms Section */}
      <View style={styles.section}>
        <CustomCheckbox
          checked={termsAccepted}
          onToggle={() => setTermsAccepted(!termsAccepted)}
          label="J'accepte les termes et conditions"
        />
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={saveDelivery}>
        <Text style={styles.saveButtonText}>Enregistrer la livraison</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 20,
  },
  toggleSection: {
    marginBottom: 30,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  dropdownContainer: {
    marginBottom: 10,
  },
  dropdownButton: {
    padding: 12,
    backgroundColor: "#f0f0f5",
    borderRadius: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownButtonText: {
    fontSize: 16,
    color: "#333",
  },
  dropdownArrow: {
    fontSize: 16,
    color: "#333",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 5,
    width: "80%",
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  toggleButton: {
    marginRight: 10,
  },
  toggle: {
    width:










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
              label: <Text>{adresse.label}</Text>,
              value: adresse.value,
            })),
          ]}
          onSelect={(value) => setSelectedAddress(value)}
        />
      </View>

      {/* Toggle Section */}
      <View style={styles.toggleSection}>
        <CustomToggle isEnabled={isExchange} onToggle={() => setIsExchange(!isExchange)} label="C'est un Échange" />
        <CustomToggle isEnabled={isFragile} onToggle={() => setIsFragile(!isFragile)} label="Colis Fragile" />
      </View>

      {/* Client Section */}
      <View style={styles.section}>
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
              label: <Text>{client.label}</Text>,
              value: client.value,
            })),
          ]}
          onSelect={(value) => setSelectedClient(value)}
        />
      </View>

      {/* Product Section */}
      <View style={styles.section}>
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
              label: <Text>{product.label}</Text>,
              value: product.value,
            })),
          ]}
          onSelect={(value) => setSelectedProduct(value)}
        />
      </View>

      {/* Payment Section */}
      <View style={styles.section}>
        <CustomDropdown
          placeholder="Sélectionnez le statut de paiement"
          options={PaiementOptions}
          onSelect={(value) => setPaymentStatus(value)}
        />
      </View>

      {/* Terms Section */}
      <View style={styles.section}>
        <CustomCheckbox
          checked={termsAccepted}
          onToggle={() => setTermsAccepted(!termsAccepted)}
          label="J'accepte les termes et conditions"
        />
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={saveDelivery}>
        <Text style={styles.saveButtonText}>Enregistrer la livraison</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 20,
  },
  toggleSection: {
    marginBottom: 30,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  dropdownContainer: {
    marginBottom: 10,
  },
  dropdownButton: {
    padding: 12,
    backgroundColor: "#f0f0f5",
    borderRadius: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownButtonText: {
    fontSize: 16,
    color: "#333",
  },
  dropdownArrow: {
    fontSize: 16,
    color: "#333",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 5,
    width: "80%",
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  toggleButton: {
    marginRight: 10,
  },
  toggle: {
    width: 40,
    height: 20,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    padding: 2,
  },
  knob: {
    width: 16,
    height: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  toggleLabel: {
    fontSize: 16,
    color: "#333",
  },
});

export default NouvelleLivraison;
