// Importations nécessaires
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { addDoc, collection, doc, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore";
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
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<string | null>(null); // Pour stocker le statut par défaut

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

  // Fetch Adresses
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


  useEffect(() => {
    const fetchDefaultStatus = async () => {
      try {
        // Récupérer tous les documents de la collection "Status"
        const statusSnapshot = await getDocs(collection(firebasestore, "Status"));
  
        // Vérifier s'il y a des documents dans la collection
        if (!statusSnapshot.empty) {
          // Récupérer le premier document
          const firstStatusDoc = statusSnapshot.docs[1];
          const defaultStatus = firstStatusDoc.data().nomStat;
  
          // Définir le statut par défaut
          setDefaultStatus(defaultStatus);
        } else {
          console.warn("Aucun statut trouvé dans la collection 'Status'.");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du statut par défaut :", error);
      }
    };
  
    fetchDefaultStatus();
  }, []);

  // Fonction pour générer un code QR à partir de l'ID de la livraison
  const generateQRCode = (deliveryId) => {
    return `https://api.qrserver.com/v1/create-qr-code/?data=${deliveryId}&size=200x200`;
  };

 // Save Delivery Function
const saveDelivery = async () => {
  if (!selectedAddress || !selectedClient || !selectedProduct || !selectedPayment) {
    alert("Veuillez remplir tous les champs obligatoires.");
    return;
  }

  try {
    // Récupérer l'ID numérique pour la livraison
    const counterDocRef = doc(collection(firebasestore, "counters"), "deliveryCounter");
    const counterDoc = await getDoc(counterDocRef);
    let newId = 1; // Valeur par défaut

    if (counterDoc.exists()) {
      newId = counterDoc.data().count + 1; // Incrémentez le compteur
      await updateDoc(counterDocRef, { count: newId }); // Mettez à jour le compteur
    } else {
      await setDoc(counterDocRef, { count: newId }); // Créez le document si nécessaire
    }

    // Créer les données de livraison
    const deliveryData = {
      id: newId, // Utiliser l'ID numérique
      address: selectedAddress,
      client: selectedClient,
      product: selectedProduct,
      payment: selectedPayment,
      isExchange,
      isFragile,
      termsAccepted,
      createdAt: new Date(),
      status: defaultStatus, // Utiliser le statut par défaut
    };

    // Enregistrer les données de la livraison dans Firestore
    await setDoc(doc(firebasestore, "livraisons", newId.toString()), deliveryData);

    // Générer le code QR avec l'ID de la livraison
    const qrCodeUrl = generateQRCode(newId);

    // Enregistrer les informations du colis dans la collection "packages"
    await addDoc(collection(firebasestore, "packages"), {
      deliveryId: newId,
      qrCodeUrl,
    });

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
                import { Ionicons } from "@expo/vector-icons";
                import { useNavigation } from "@react-navigation/native";
                import { addDoc, collection, doc, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore";
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
                  const [adresses, setAddresses] = useState<DropdownOption[]>([]);
                  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
                  const [selectedClient, setSelectedClient] = useState<string | null>(null);
                  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
                  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
                  const [defaultStatus, setDefaultStatus] = useState<string | null>(null);
                
                  const PaiementOptions = [
                    { label: "Percevoir le paiement", value: "percevoir" },
                    { label: "payé", value: "payé" },
                  ];
                
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
                
                  useEffect(() => {
                    const fetchAddresses = async () => {
                      const querySnapshot = await getDocs(collection(firebasestore, "adresses"));
                      const addressOptions = querySnapshot.docs.map((doc) => ({
                        label: doc.data().address,
                        value: doc.id,
                      }));
                      setAddresses(addressOptions);
                    };
                    fetchAddresses();
                  }, []);
                
                  useEffect(() => {
                    const fetchDefaultStatus = async () => {
                      try {
                        const statusSnapshot = await getDocs(collection(firebasestore, "Status"));
                        if (!statusSnapshot.empty) {
                          const firstStatusDoc = statusSnapshot.docs[0];
                          const defaultStatus = firstStatusDoc.data().nomStat;
                          setDefaultStatus(defaultStatus);
                        } else {
                          console.warn("Aucun statut trouvé dans la collection 'Status'.");
                        }
                      } catch (error) {
                        console.error("Erreur lors de la récupération du statut par défaut :", error);
                      }
                    };
                    fetchDefaultStatus();
                  }, []);
                
                  const generateQRCode = (deliveryId: number) => {
                    return `https://api.qrserver.com/v1/create-qr-code/?data=${deliveryId}&size=200x200`;
                  };
                
                  const saveDelivery = async () => {
                    if (!selectedAddress || !selectedClient || !selectedProduct || !selectedPayment) {
                      alert("Veuillez remplir tous les champs obligatoires.");
                      return;
                    }
                
                    try {
                      const counterDocRef = doc(collection(firebasestore, "counters"), "deliveryCounter");
                      const counterDoc = await getDoc(counterDocRef);
                      let newId = 1;
                
                      if (counterDoc.exists()) {
                        newId = counterDoc.data().count + 1;
                        await updateDoc(counterDocRef, { count: newId });
                      } else {
                        await setDoc(counterDocRef, { count: newId });
                      }
                
                      const deliveryData = {
                        id: newId,
                        address: selectedAddress,
                        client: selectedClient,
                        product: selectedProduct,
                        payment: selectedPayment,
                        isExchange,
                        isFragile,
                        termsAccepted,
                        createdAt: new Date(),
                        status: defaultStatus,
                      };
                
                      await setDoc(doc(firebasestore, "livraisons", newId.toString()), deliveryData);
                      const qrCodeUrl = generateQRCode(newId);
                      await addDoc(collection(firebasestore, "packages"), {
                        deliveryId: newId,
                        qrCodeUrl,
                      });
                
                      alert("Livraison enregistrée avec succès !");
                      navigation.goBack();
                    } catch (error) {
                      console.error("Erreur lors de l'enregistrement de la livraison :", error);
                      alert("Une erreur s'est produite lors de l'enregistrement de la livraison.");
                    }
                  };
                
                  // Custom components for toggle, dropdown, and checkbox omitted for brevity...
                
                  return (
                    <View style={styles.container}>
                      <View style={styles.header}>
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                          <Ionicons name="arrow-back" size={24} color="black" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Nouvelle livraison</Text>
                      </View>
                
                      {/* Sections for Address, Client, Product, Payment, and Terms omitted for brevity... */}
                
                      <TouchableOpacity style={styles.saveButton} activeOpacity={0.8} onPress={saveDelivery}>
                        <Text style={styles.saveButtonText}>Sauvegarder</Text>
                      </TouchableOpacity>
                    </View>
                  );
                };
                
                const styles = StyleSheet.create({
                  // Styles omitted for brevity...
                });
                
                export default NouvelleLivraison;

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
    color: "#000",
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