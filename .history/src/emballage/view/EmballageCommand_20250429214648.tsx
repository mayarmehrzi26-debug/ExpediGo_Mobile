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
import CustomDropdown from "../../components/CustomDropdown";
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
    loading,
    refreshAddresses
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
          {size.available ? size.dimensions : "Non disponible pour le moment."}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Commandes d'emballage</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("EmballageList")}>
          <Ionicons name="time-outline" size={24} color="black" style={styles.headerImage} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Adresse de livraison</Text>
          {loading.addresses ? (
            <ActivityIndicator size="small" color="#877DAB" />
          ) : (
            <CustomDropdown
              placeholder="Sélectionnez une adresse"
              options={[
                {
                  label: (
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Ionicons name="add-circle" size={18} color="#877DAB" style={{ marginRight: 8 }} />
                      <Text>Ajouter une nouvelle adresse</Text>
                    </View>
                  ),
                  value: "new_address",
                },
                ...adresses.map((adresse) => ({
                  label: adresse.label,
                  value: adresse.value,
                })),
              ]}
              onSelect={(value) => {
                if (value === "new_address") {
                  navigation.navigate("AjoutAdress");
                } else {
                  handleAddressSelect(value);
                }
              }}
              selectedValue={selectedAddress}
              rightIcon={
                <TouchableOpacity onPress={refreshAddresses}>
                  <Ionicons name="refresh" size={20} color="#877DAB" />
                </TouchableOpacity>
              }
            />
          )}

          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="warning-outline" size={20} color="red" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Text style={styles.sectionTitle}>La taille de l'emballage</Text>
          <View style={styles.sizesContainer}>{sizes.map(renderSizeOption)}</View>

          <View style={styles.quantitySection}>
            <Text style={styles.sectionTitle}>Quantité</Text>
            <TextInput
              style={styles.quantityInput}
              value={quantity}
              onChangeText={handleQuantityChange}
              keyboardType="numeric"
              placeholder="Entrez la quantité"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.priceContainer}>
            <View>
              <Text style={styles.priceLabel}>Prix unitaire (TTC)</Text>
              <Text style={styles.priceLabel}>Prix total (TTC)</Text>
            </View>
            <View style={styles.priceValues}>
              <Text style={styles.priceValue}>
                {selectedSizeData?.price || 0} millimes
              </Text>
              <Text style={styles.priceValue}>{totalPrice.toFixed(2)} Dinars</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[
              styles.orderButton,
              !selectedAddress && styles.disabledButton
            ]} 
            onPress={async () => {
              const success = await handleOrder();
              if (success) {
                Alert.alert("Succès", "Commande enregistrée avec succès");
                setQuantity("");
              }
            }}
            disabled={!selectedAddress || loading.submission}
          >
            {loading.submission ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.orderButtonText}>
                {selectedAddress ? "Commander" : "Sélectionnez une adresse"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default EmballageCommand;