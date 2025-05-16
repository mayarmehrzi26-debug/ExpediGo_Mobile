import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEmballagePresenter } from "../presenter/emballage.presenter";
import { styles } from "../emballage.styles";

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
          >
            <Text style={styles.orderButtonText}>Commander</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};