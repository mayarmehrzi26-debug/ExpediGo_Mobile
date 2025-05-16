import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import CustomDropdown from "../../components/";
import { styles } from "../emballage.styles";
import { useEmballagePresenter } from "../presenter/emballage.presenter";

interface EmballageCommandProps {
  navigation: any;
}

export const EmballageCommand: React.FC<EmballageCommandProps> = ({ navigation }) => {
  const {
    sizes,
    selectedSize,
    setSelectedSize,
    quantity,
    handleQuantityChange,
    selectedSizeData,
    totalPrice,
    handleOrder,
    error,
    adresses,
    selectedAddress,
    handleAddressSelect,
    loading
  } = useEmballagePresenter();

  const renderSizeOption = (size: EmballageSize) => (
    <TouchableOpacity
      key={size.id}
      style={[
        styles.sizeOption,
        selectedSize === size.id && styles.selectedSizeOption,
        !size.available && styles.disabledSizeOption,
      ]}
      onPress={() => size.available && setSelectedSize(size.id)}
      disabled={!size.available}
    >
      <View style={styles.sizeOptionContent}>
        <Text
          style={[
            styles.sizeLabel,
            selectedSize === size.id && styles.selectedSizeLabel,
            !size.available && styles.disabledText,
          ]}
        >
          {size.label}
        </Text>
        <Text
          style={[
            styles.sizeDimensions,
            selectedSize === size.id && styles.selectedSizeDimensions,
            !size.available && styles.disabledText,
          ]}
        >
          {size.available ? size.dimensions : "Indisponible"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const handleSubmit = async () => {
    const success = await handleOrder();
    if (success) {
      Alert.alert(
        "Succès", 
        "Commande créée avec succès",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouvelle commande</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Adresse de livraison</Text>
          
          {loading.addresses ? (
            <ActivityIndicator size="small" color="#877DAB" />
          ) : (
            <CustomDropdown
              placeholder="Sélectionner une adresse"
              options={[
                {
                  label: (
                    <View style={styles.addAddressOption}>
                      <Ionicons name="add" size={18} color="#877DAB" />
                      <Text style={styles.addAddressText}>Nouvelle adresse</Text>
                    </View>
                  ),
                  value: "new_address",
                },
                ...adresses.map(addr => ({
                  label: addr.label,
                  value: addr.value,
                }))
              ]}
              onSelect={handleAddressSelect}
              selectedValue={selectedAddress}
            />
          )}

          <Text style={styles.sectionTitle}>Taille d'emballage</Text>
          <View style={styles.sizesContainer}>
            {sizes.map(renderSizeOption)}
          </View>

          <View style={styles.quantitySection}>
            <Text style={styles.sectionTitle}>Quantité</Text>
            <TextInput
              style={styles.quantityInput}
              value={quantity}
              onChangeText={handleQuantityChange}
              keyboardType="numeric"
              placeholder="Nombre d'emballages"
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text>Prix unitaire:</Text>
              <Text style={styles.priceText}>
                {(selectedSizeData?.price || 0).toFixed(3)} TND
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text>Total:</Text>
              <Text style={styles.priceText}>
                {totalPrice.toFixed(3)} TND
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              (loading.submission || !selectedAddress) && styles.disabledButton
            ]}
            onPress={handleSubmit}
            disabled={loading.submission || !selectedAddress}
          >
            {loading.submission ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>
                {selectedAddress ? "Valider la commande" : "Sélectionnez une adresse"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default EmballageCommand;