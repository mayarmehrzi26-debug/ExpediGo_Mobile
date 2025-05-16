import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import {CustomCheckbox} from "../components/CustomCheckbox";
import { CustomDropdown } from "../components/CustomDropdown";
import { CustomToggle } from "../components/CustomToggle";
import { useLivraisonPresenter } from "../presenter/livraison.presenter";
import { styles } from "../types/NouvelleLivraisonView.styles";

const PaiementOptions = [
  { label: "Percevoir le paiement", value: "percevoir" },
  { label: "payé", value: "payé" },
];

export const NouvelleLivraisonView: React.FC = () => {
  const {
    form,
    products,
    clients,
    adresses,
    handleFieldChange,
    handleSaveDelivery,
  } = useLivraisonPresenter();

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
        {/* Adresse Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Adresse de pickup</Text>
            <Text style={styles.sectionSubtitle}>(la même adresse de retour)</Text>
          </View>
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
                label: adresse.label,
                value: adresse.value,
              })),
            ]}
            onSelect={(value) => handleFieldChange("address", value)}
            selectedValue={form.address}
            onAddNew={() => navigation.navigate("AjoutAdress" as never)}
          />
        </View>

        {/* Toggle Section */}
        <View style={styles.toggleSection}>
          <CustomToggle 
            isEnabled={form.isExchange} 
            onToggle={() => handleFieldChange("isExchange", !form.isExchange)} 
            label="C'est un Échange" 
          />
          <CustomToggle 
            isEnabled={form.isFragile} 
            onToggle={() => handleFieldChange("isFragile", !form.isFragile)} 
            label="Colis Fragile" 
          />
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
                label: client.label,
                value: client.value,
              })),
            ]}
            onSelect={(value) => handleFieldChange("client", value)}
            selectedValue={form.client}
            onAddNew={() => navigation.navigate("AjoutClientView" as never)}
          />
        </View>

        {/* Product Section */}
        

        {/* Payment Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paiement</Text>
          <CustomDropdown
            placeholder="Sélectionnez le statut du paiement"
            options={PaiementOptions}
            onSelect={(value) => handleFieldChange("payment", value)}
            selectedValue={form.payment}
          />
        </View>

        <View style={styles.separator1} />
        <Text style={styles.totalAmountText}>Total: {form.totalAmount} DT</Text>

        {/* Terms Section */}
        <View style={styles.termsSection}>
          <CustomCheckbox
            checked={form.termsAccepted}
            onToggle={() => handleFieldChange("termsAccepted", !form.termsAccepted)}
            label="Je reconnais que le colis ne contient aucun matériel illégal ou dangereux."
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={styles.saveButton} 
          activeOpacity={0.8} 
          onPress={handleSaveDelivery}
        >
          <Text style={styles.saveButtonText}>Sauvegarder</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};