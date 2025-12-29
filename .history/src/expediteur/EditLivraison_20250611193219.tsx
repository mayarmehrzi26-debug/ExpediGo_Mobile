import { useNavigation, useRoute } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { firebasestore } from "../../FirebaseConfig";
import Header from "../../src/components/Header";
import Button from "../../src/components/shared/Button";
import InputField from "../../src/components/shared/InputField";
import SelectDropdown from "../../src/components/shared/SelectDropdown";
import StatusBadge from "../../src/components/StatusBadge";
import { LivraisonModel } from "../models/Livraison";

interface EditLivraisonRouteParams {
  deliveryId: string;
}

const EditLivraison: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { deliveryId } = route.params as EditLivraisonRouteParams;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [delivery, setDelivery] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    client: "",
    address: "",
    product: "",
    quantity: "1",
    notes: "",
    status: "",
    isFragile: false,
    isExchange: false,
  });

  const auth = getAuth();
  const currentUser = auth.currentUser;
  const model = new LivraisonModel();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch delivery details
        const deliveryRef = doc(firebasestore, "livraisons", deliveryId);
        const deliverySnap = await getDoc(deliveryRef);
        
        if (!deliverySnap.exists()) {
          throw new Error("Livraison non trouvée");
        }
        
        const deliveryData = deliverySnap.data();
        setDelivery(deliveryData);
        
        // Set initial form values
        setFormData({
          client: deliveryData.clientId || "",
          address: deliveryData.addressId || "",
          product: deliveryData.productId || "",
          quantity: deliveryData.quantity?.toString() || "1",
          notes: deliveryData.notes || "",
          status: deliveryData.status || "",
          isFragile: deliveryData.isFragile || false,
          isExchange: deliveryData.isExchange || false,
        });
        
        // Fetch dropdown options
        const [productsRes, clientsRes, addressesRes, statusesRes] = await Promise.all([
          model.fetchProducts(),
          model.fetchClients(),
          model.fetchAdresses(),
          getStatusOptions(),
        ]);
        
        setProducts(productsRes);
        setClients(clientsRes);
        setAddresses(addressesRes);
        setStatuses(statusesRes);
        
      } catch (error) {
        console.error("Error fetching data:", error);
        Alert.alert("Erreur", "Impossible de charger les données de la livraison");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [deliveryId]);

  const getStatusOptions = async () => {
    // You might want to fetch these from Firestore or define them statically
    return [
      { label: "Non traité", value: "Non traité" },
      { label: "En attente d'enlèvement", value: "En attente d'enlèvement" },
      { label: "En cours de pickup", value: "En cours de pickup" },
      { label: "Picked", value: "Picked" },
      { label: "En cours de livraison", value: "En cours de livraison" },
      { label: "Livré", value: "Livré" },
      { label: "Retour", value: "Retour" },
      { label: "Annulée", value: "Annulée" },
    ];
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      if (!currentUser) {
        throw new Error("Utilisateur non connecté");
      }
      
      setSaving(true);
      
      const updatedData = {
        ...formData,
        quantity: parseInt(formData.quantity) || 1,
        updatedAt: new Date(),
        updatedBy: currentUser.uid,
      };
      
      const deliveryRef = doc(firebasestore, "livraisons", deliveryId);
      await updateDoc(deliveryRef, updatedData);
      
      Alert.alert("Succès", "Livraison mise à jour avec succès");
      navigation.goBack();
      
    } catch (error) {
      console.error("Error saving delivery:", error);
      Alert.alert("Erreur", "Une erreur est survenue lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Modifier Livraison" showBackButton={true} />
        <View style={styles.loadingContainer}>
          <Text>Chargement...</Text>
        </View>
      </View>
    );
  }

  if (!delivery) {
    return (
      <View style={styles.container}>
        <Header title="Modifier Livraison" showBackButton={true} />
        <View style={styles.errorContainer}>
          <Text>Livraison non trouvée</Text>
        </View>
      </View>
    );
  }

  const selectedProduct = products.find(p => p.value === formData.product);
  const selectedClient = clients.find(c => c.value === formData.client);
  const selectedAddress = addresses.find(a => a.value === formData.address);

  return (
    <View style={styles.container}>
      <Header title="Modifier Livraison" showBackButton={true} />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.deliveryInfo}>
          <Text style={styles.deliveryId}>Livraison #{deliveryId.substring(0, 8)}</Text>
          <StatusBadge status={delivery.status} />
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Informations client</Text>
          
          <SelectDropdown
            label="Client"
            options={clients}
            selectedValue={formData.client}
            onValueChange={(value) => handleInputChange("client", value)}
            placeholder="Sélectionner un client"
          />
          
          <SelectDropdown
            label="Adresse"
            options={addresses}
            selectedValue={formData.address}
            onValueChange={(value) => handleInputChange("address", value)}
            placeholder="Sélectionner une adresse"
          />
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Détails de la livraison</Text>
          
          <SelectDropdown
            label="Produit"
            options={products}
            selectedValue={formData.product}
            onValueChange={(value) => handleInputChange("product", value)}
            placeholder="Sélectionner un produit"
          />
          
          {selectedProduct && (
            <View style={styles.productInfo}>
              <Text style={styles.productPrice}>
                Prix: {selectedProduct.price} DT
              </Text>
            </View>
          )}
          
          <InputField
            label="Quantité"
            value={formData.quantity}
            onChangeText={(text) => handleInputChange("quantity", text)}
            keyboardType="numeric"
          />
          
          <SelectDropdown
            label="Statut"
            options={statuses}
            selectedValue={formData.status}
            onValueChange={(value) => handleInputChange("status", value)}
            placeholder="Sélectionner un statut"
          />
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Options</Text>
          
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                formData.isFragile && styles.optionButtonSelected
              ]}
              onPress={() => handleInputChange("isFragile", !formData.isFragile)}
            >
              <Text style={styles.optionButtonText}>Fragile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.optionButton,
                formData.isExchange && styles.optionButtonSelected
              ]}
              onPress={() => handleInputChange("isExchange", !formData.isExchange)}
            >
              <Text style={styles.optionButtonText}>Échange</Text>
            </TouchableOpacity>
          </View>
          
          <InputField
            label="Notes"
            value={formData.notes}
            onChangeText={(text) => handleInputChange("notes", text)}
            multiline
            numberOfLines={3}
          />
        </View>
        
        <View style={styles.buttonContainer}>
          <Button
            title="Enregistrer les modifications"
            onPress={handleSave}
            loading={saving}
            disabled={saving}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  deliveryInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  deliveryId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  formSection: {
    marginBottom: 25,
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#44076A",
  },
  productInfo: {
    marginTop: 10,
    marginBottom: 15,
  },
  productPrice: {
    fontSize: 14,
    color: "#666",
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  optionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    marginHorizontal: 5,
  },
  optionButtonSelected: {
    backgroundColor: "#E0D0F0",
    borderColor: "#44076A",
    borderWidth: 1,
  },
  optionButtonText: {
    color: "#333",
  },
  buttonContainer: {
    marginTop: 20,
  },
});

export default EditLivraison;