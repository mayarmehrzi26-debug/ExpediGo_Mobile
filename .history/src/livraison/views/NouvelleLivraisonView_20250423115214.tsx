import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { CustomDropdown } from "../components/CustomDropdown";
import { useLivraisonPresenter } from "../presenter/livraison.presenter";
import { styles } from "./NouvelleLivraisonView.styles";

const PaiementOptions = [
  { label: "Percevoir le paiement", value: "percevoir" },
  { label: "payé", value: "payé" },
];

export const NouvelleLivraisonView: React.FC = () => {
  const {
    isLoading,
    error,
    form,
    products,
    clients,
    adresses,
    handleFieldChange,
    handleSaveDelivery,
  } = useLivraisonPresenter();

  React.useEffect(() => {
    if (error) {
      Alert.alert("Erreur", error);
    }
  }, [error]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#574599" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouvelle livraison</Text>
      </View>

      <ScrollView>
        {/* ... (le reste de votre JSX existant) ... */}
        
        {/* Exemple de composant avec les props corrigées */}
        <CustomDropdown
          placeholder="Sélectionnez un produit"
          options={[
            ...products.map(product => ({
              label: product.label,
              value: product.value,
              image: product.image
            })),
            {
              label: (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Icon name="plus-circle" size={18} color="blue" />
                  <Text>Ajouter un produit</Text>
                </View>
              ),
              value: "new_product"
            }
          ]}
          onSelect={(value) => {
            if (value === "new_product") {
              navigation.navigate("AjoutProd" as never);
            } else {
              handleFieldChange("product", value);
            }
          }}
          selectedValue={form.product}
        />

        {/* ... (le reste de votre JSX) ... */}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  ...styles,
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});