import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/Feather";
import { CustomDropdown } from "./CustomDropdown";
import { CustomToggle } from "./CustomToggle";
import { CustomCheckbox } from "./CustomCheckbox";
import { styles } from "./NouvelleLivraisonStyles";

interface NouvelleLivraisonViewProps {
  isExchange: boolean;
  isFragile: boolean;
  termsAccepted: boolean;
  products: any[];
  clients: any[];
  adresses: any[];
  selectedAddress: string | null;
  selectedClient: string | null;
  selectedProduct: string | null;
  selectedPayment: string | null;
  quantity: number;
  totalAmount: number;
  productPrice: number;
  PaiementOptions: any[];
  navigation: any;
  setIsExchange: (value: boolean) => void;
  setIsFragile: (value: boolean) => void;
  setTermsAccepted: (value: boolean) => void;
  setSelectedAddress: (value: string | null) => void;
  setSelectedClient: (value: string | null) => void;
  setSelectedProduct: (value: string | null) => void;
  setSelectedPayment: (value: string | null) => void;
  setQuantity: (value: number) => void;
  setProductPrice: (value: number) => void;
  setTotalAmount: (value: number) => void;
  handleSaveDelivery: () => void;
  handleProductSelect: (value: string) => void;
}

export const NouvelleLivraisonView: React.FC<NouvelleLivraisonViewProps> = ({
  isExchange,
  isFragile,
  termsAccepted,
  products,
  clients,
  adresses,
  selectedAddress,
  selectedClient,
  selectedProduct,
  selectedPayment,
  quantity,
  totalAmount,
  productPrice,
  PaiementOptions,
  navigation,
  setIsExchange,
  setIsFragile,
  setTermsAccepted,
  setSelectedAddress,
  setSelectedClient,
  setSelectedProduct,
  setSelectedPayment,
  setQuantity,
  setProductPrice,
  setTotalAmount,
  handleSaveDelivery,
  handleProductSelect,
}) => {
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
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Adresse de pickup</Text>
            <Text style={styles.sectionSubtitle}>
              (la même adresse de retour)
            </Text>
          </View>
          <CustomDropdown
            placeholder="Sélectionnez une adresse"
            options={[
              {
                label: (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Icon
                      name="plus-circle"
                      size={18}
                      color="blue"
                      style={{ marginRight: 8 }}
                    />
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
                navigation.navigate("AjoutAdress" as never);
              } else {
                setSelectedAddress(value);
              }
            }}
            selectedValue={selectedAddress}
          />
        </View>

        <View style={styles.toggleSection}>
          <CustomToggle
            isEnabled={isExchange}
            onToggle={() => setIsExchange(!isExchange)}
            label="C'est un Échange"
          />
          <CustomToggle
            isEnabled={isFragile}
            onToggle={() => setIsFragile(!isFragile)}
            label="Colis Fragile"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ajouter un client</Text>
          <Text style={styles.description}>
            Saisissez le nom, l'adresse ou le numéro de téléphone pour localiser
            le profil recherché.
          </Text>
          <CustomDropdown
            placeholder="Sélectionnez un client"
            options={[
              {
                label: (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Icon
                      name="plus-circle"
                      size={18}
                      color="blue"
                      style={{ marginRight: 8 }}
                    />
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
            onSelect={(value) => {
              if (value === "new_client") {
                navigation.navigate("AjoutClientView" as never);
              } else {
                setSelectedClient(value);
              }
            }}
            selectedValue={selectedClient}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ajouter un Produit</Text>
          <CustomDropdown
            placeholder="Sélectionnez un produit"
            options={[
              selectedProduct
                ? {
                    label: products.find(
                      (product) => product.value === selectedProduct
                    )?.label,
                    value: selectedProduct,
                  }
                : { label: "Sélectionnez un produit", value: "" },
              {
                label: (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Icon
                      name="plus-circle"
                      size={18}
                      color="blue"
                      style={{ marginRight: 8 }}
                    />
                    <Text>Ajouter un nouveau produit</Text>
                  </View>
                ),
                value: "new_product",
              },
              ...products.map((product) => ({
                label: (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {product.image && (
                      <Image
                        source={{ uri: product.image }}
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 15,
                          marginRight: 8,
                        }}
                      />
                    )}
                    <Text style={{ flex: 1 }}>{product.label}</Text>
                  </View>
                ),
                value: product.value,
              })),
            ]}
            onSelect={handleProductSelect}
            selectedValue={selectedProduct}
          />
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => {
                const newQuantity = Math.max(1, quantity - 1);
                setQuantity(newQuantity);
                setTotalAmount(newQuantity * productPrice);
              }}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.quantityInput}
              placeholder="Quantité"
              keyboardType="numeric"
              value={quantity.toString()}
              onChangeText={(text) => {
                const newQuantity = parseInt(text, 10) || 1;
                setQuantity(newQuantity);
                setTotalAmount(newQuantity * productPrice);
              }}
            />
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => {
                const newQuantity = quantity + 1;
                setQuantity(newQuantity);
                setTotalAmount(newQuantity * productPrice);
              }}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paiement</Text>
          <CustomDropdown
            placeholder="Sélectionnez le statut du paiement"
            options={PaiementOptions}
            onSelect={(value) => setSelectedPayment(value)}
            selectedValue={selectedPayment}
          />
        </View>
        <View style={styles.separator1} />
        <Text style={styles.totalAmountText}>Total: {totalAmount} DT</Text>

        <View style={styles.termsSection}>
          <CustomCheckbox
            checked={termsAccepted}
            onToggle={() => setTermsAccepted(!termsAccepted)}
            label="Je reconnais que le colis ne contient aucun matériel illégal ou dangereux."
          />
        </View>

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