import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Animated,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import firestore from '@react-native-firebase/firestore';

import Icon from "react-native-vector-icons/Feather";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { firebasestore } from "../FirebaseConfig";

interface AjoutProdProps {
  navigation: any;
}

const AjoutProd: React.FC<AjoutProdProps> = ({ navigation }) => {
  const [productName, setProductName] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission nécessaire",
        "Nous avons besoin de votre permission pour accéder à la galerie",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!productName || !amount || !description) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    try {
      setLoading(true);
      let imageUrl = null;

      // If an image is selected, you can use it directly or leave the URL empty
      if (image) {
        imageUrl = image; // Store the local URI (you can also use a default URL)
      }

      await addDoc(collection(firebasestore, "products"), {
        name: productName,
        amount: parseFloat(amount.replace(",", ".")),
        description,
        imageUrl,  // Store the image URI (or leave it empty)
        createdAt: serverTimestamp(),
      });

      Alert.alert("Succès", "Produit ajouté avec succès", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Erreur lors de l'ajout du produit:", error);
      Alert.alert(
        "Erreur",
        "Une erreur s'est produite lors de l'ajout du produit",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajouter un produit</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image }} style={styles.selectedImage} />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Ionicons
                  name="cloud-upload-outline"
                  size={50}
                  color="#A7A9B7"
                />
                <Text style={styles.uploadText}>Ajouter une photo</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nom de produit</Text>
            <TextInput
              style={styles.input}
              placeholder="Veuillez entrer le nom du produit"
              placeholderTextColor="#A7A9B7"
              value={productName}
              onChangeText={setProductName}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Montant</Text>
            <Text style={styles.helperText}>
              Veuillez saisir le montant en dinars tunisien, par exemple
              soixante-cinq dinars sept cent est représenté par 65.700
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Veuillez entrer le montant"
              placeholderTextColor="#A7A9B7"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Information additionnelle</Text>
            <TextInput
              style={styles.input}
              placeholder="Description du produit"
              placeholderTextColor="#A7A9B7"
              multiline
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Créer un produit</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 51,
    paddingBottom: 14,
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
  scrollContent: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  imageUpload: {
    alignSelf: "center",
    width: 220,
    height: 172,
    marginBottom: 48,
    borderRadius: 17,
    borderWidth: 1.7,
    borderStyle: "dashed",
    borderColor: "#A7A9B7",
    overflow: "hidden",
  },
  uploadPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadText: {
    marginTop: 10,
    color: "#A7A9B7",
    fontSize: 16,
  },
  selectedImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    color: "#27251F",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 15,
  },
  helperText: {
    color: "#A7A9B7",
    fontSize: 9,
    fontWeight: "500",
    marginBottom: 14,
    lineHeight: 13,
  },
  input: {
    height: 42,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#A7A9B7",
    fontSize: 11,
    color: "#27251F",
  },
  submitButton: {
    width: 224,
    height: 37,
    borderRadius: 5.4,
    backgroundColor: "#54E598",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 40,
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "800",
  },
});

export default AjoutProd;

// Interfaces
interface DropdownOption {
  label: string;
  value: string;
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
const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options = [],
  placeholder,
  onSelect,
  selectedValue,
}) => {
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
                  <Text style={styles.optionText}>{item.label}</Text>
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

// Main Component
export const NouvelleLivraison: React.FC = () => {
  const navigation = useNavigation();

  const [isExchange, setIsExchange] = useState(false);
  const [isFragile, setIsFragile] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const PaiementOptions = [
    { label: "Service commercial", value: "commercial" },
    { label: "Service technique", value: "technique" },
  ];

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
        <CustomDropdown placeholder="Ajouter un client" onSelect={() => {}} />
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
      { label: "Produit A", value: "product_a" },
      { label: "Produit B", value: "product_b" },
    ]}
    onSelect={(value) => {
      if (value === "new_product") {
        navigation.navigate("AjoutProd");
      }
    }}
  />
</View>




      {/* Payment Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Paiement</Text>
        <CustomDropdown placeholder="Sélectionnez le statut du paiement"  options={PaiementOptions} onSelect={() => {}} />
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

const styles = StyleSheet.create({
  container: {
    flex:1,
    padding: 20,
    backgroundColor: "#F7F7F7",

  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 21,
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
    marginBottom: 8,
  },
  sectionTitle: {
    color: "#27251F",
    fontSize: 13,
    fontFamily: "Avenir",
    fontWeight: "500",
  },
  sectionSubtitle: {
    color: "#A7A9B7",
    fontSize: 9,
    fontFamily: "Avenir",
    marginLeft: 4,
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
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#F8F8F8",
  },
  text: {
    marginLeft: 10,
    fontSize: 16,
    color: "black",
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
  clientItem: {
    flexDirection: "row",
    padding: 10,
    gap: 15,
    alignItems: "center",
    borderTopWidth: 0.8,
    borderTopColor: "rgba(167,169,183,0.32)",
  },
  clientAvatar: {
    width: 33,
    height: 33,
    borderRadius: 50,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    color: "#27251F",
    fontSize: 12,
    fontFamily: "Avenir",
    marginBottom: 2,
  },
  clientDetail: {
    color: "#696C71",
    fontSize: 10,
    fontFamily: "Avenir",
    marginBottom: 2,
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


