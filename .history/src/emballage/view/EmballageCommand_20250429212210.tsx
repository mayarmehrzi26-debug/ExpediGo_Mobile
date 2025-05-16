import { Ionicons } from "@expo/vector-icons";
import { getAuth } from "firebase/auth";
import React from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator
} from "react-native";
import { styles } from "../emballage.styles";
import { useEmballagePresenter } from "../presenter/emballage.presenter";
import CustomDropdown from "../../";

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
    setSelectedAddress,
    loadingAdresses
  } = useEmballagePresenter();
  
  const auth = getAuth();
  const currentUser = auth.currentUser;

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
          {currentUser && (
            <Text style={styles.userInfo}>
              Connecté en tant que: {currentUser.email || "Utilisateur"}
            </Text>
          )}

          <Text style={styles.sectionTitle}>Adresse de livraison</Text>
          {loadingAdresses ? (
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
                  value: "new_adresse",
                },
                ...adresses.map((adresse) => ({
                  label: adresse.label,
                  value: adresse.value,
                })),
              ]}
              onSelect={(value) => {
                if (value === "new_adresse") {
                  navigation.navigate("AjoutAdress");
                } else {
                  setSelectedAddress(value);
                }
              }}
              selectedValue={selectedAddress}
            />
          )}

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
            {error && <Text style={styles.errorText}>{error}</Text>}
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
            style={styles.orderButton} 
            onPress={async () => {
              const success = await handleOrder();
              if (success) {
                Alert.alert("Succès", "Commande enregistrée avec succès");
              }
            }}
            disabled={!selectedAddress}
          >
            <Text style={styles.orderButtonText}>
              {selectedAddress ? "Commander" : "Sélectionnez une adresse"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default EmballageCommand;