import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Animated,
  FlatList,
  Modal,
  Text,
  TouchableOpacity,
  View
} from "react-native";

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

  const addressOptions = [
    { label: "Service commercial", value: "commercial" },
    { label: "Service technique", value: "technique" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Commandes d'emballage</Text>
      </View>

      {/* Pickup Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Adresse de pickup</Text>
          <Text style={styles.sectionSubtitle}>(la même adresse de retour)</Text>
        </View>
        <CustomDropdown placeholder="Sélectionnez une adresse" options={addressOptions} onSelect={() => {}} />
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
        <Text style={styles.sectionTitle}>Ajouter un produit</Text>
        <CustomDropdown placeholder="Ajouter un Produit" onSelect={() => {}} />
      </View>

      {/* Payment Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Paiement</Text>
        <CustomDropdown placeholder="Sélectionnez le statut du paiement" onSelect={() => {}} />
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

export default NouvelleLivraison;
