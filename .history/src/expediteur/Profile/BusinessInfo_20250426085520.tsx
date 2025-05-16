import { useNavigation } from "@react-navigation/native";
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
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
  View
} from "react-native";
import { firebaseAuth } from "../../../FirebaseConfig";
import Header from "../../src/components/Header";

interface BusinessData {
  businessName?: string;
  businessReason?: string;
  businessRegistration?: string;
  businessTaxId?: string;
  accountHolder?: string;
  rib?: string;
  contactEmail?: string;
  businessTel?: string;
  website?: string;
  address?: string;
  photoURL?: string;
  name?: string;
}

const BusinessInfo: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [businessData, setBusinessData] = useState<BusinessData>({});

  useEffect(() => {
    const fetchBusinessData = async () => {
      const user = firebaseAuth.currentUser;
      if (user) {
        const db = getFirestore();
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setBusinessData({
              businessName: userData.businessName || "",
              businessReason: userData.businessReason || "",
              businessRegistration: userData.businessRegistration || "",
              businessTaxId: userData.businessTaxId || "",
              accountHolder: userData.accountHolder || "",
              rib: userData.rib || "",
              contactEmail: userData.contactEmail || "",
              businessTel: userData.businessTel || "",
              website: userData.website || "",
              address: userData.address || "",
              photoURL: user.photoURL || "https://avatar.iran.liara.run/public/77",
              name: userData.nom || user.displayName || "Utilisateur"
            });
          }
        } catch (error) {
          console.error("Error fetching business data:", error);
          Alert.alert("Erreur", "Impossible de charger les informations professionnelles");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchBusinessData();
  }, []);

  const handleSave = async () => {
    const user = firebaseAuth.currentUser;
    if (!user) {
      Alert.alert("Erreur", "Utilisateur non connecté");
      return;
    }

    if (!businessData.businessName || !businessData.contactEmail) {
      Alert.alert("Erreur", "Veuillez remplir les champs obligatoires (Nom commercial et Email de contact)");
      return;
    }

    setSaving(true);
    const db = getFirestore();

    try {
      await updateDoc(doc(db, "users", user.uid), {
        businessName: businessData.businessName,
        businessReason: businessData.businessReason,
        businessRegistration: businessData.businessRegistration,
        businessTaxId: businessData.businessTaxId,
        accountHolder: businessData.accountHolder,
        rib: businessData.rib,
        contactEmail: businessData.contactEmail,
        businessTel: businessData.businessTel,
        website: businessData.website,
        address: businessData.address,
        updatedAt: new Date().toISOString()
      });

      Alert.alert("Succès", "Informations professionnelles mises à jour avec succès");
    } catch (error) {
      console.error("Error updating business info:", error);
      Alert.alert("Erreur", "Une erreur est survenue lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof BusinessData, value: string) => {
    setBusinessData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Informations de Business" showBackButton={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#877DAB" />
          <Text>Chargement des données...</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <Header title="Informations de Business" showBackButton={true} />
      <View style={styles.profileContainer}>
        <Image
          source={{ uri: businessData.photoURL }}
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>{businessData.name}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.menuContainer}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Nom commercial *</Text>
          <TextInput
            style={styles.input}
            placeholder="Veuillez entrer le nom commercial"
            placeholderTextColor="#A7A9B7"
            value={businessData.businessName}
            onChangeText={(text) => handleInputChange('businessName', text)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Raison sociale</Text>
          <TextInput
            style={styles.input}
            placeholder="Entrez la raison sociale"
            placeholderTextColor="#A7A9B7"
            value={businessData.businessReason}
            onChangeText={(text) => handleInputChange('businessReason', text)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Registre du commerce</Text>
          <TextInput
            style={styles.input}
            placeholder="Entrez le numéro de registre du commerce"
            placeholderTextColor="#A7A9B7"
            value={businessData.businessRegistration}
            onChangeText={(text) => handleInputChange('businessRegistration', text)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Matricule fiscal</Text>
          <TextInput
            style={styles.input}
            placeholder="Entrez le matricule fiscal"
            placeholderTextColor="#A7A9B7"
            value={businessData.businessTaxId}
            onChangeText={(text) => handleInputChange('businessTaxId', text)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Titulaire du compte</Text>
          <TextInput
            style={styles.input}
            placeholder="Entrez le titulaire du compte"
            placeholderTextColor="#A7A9B7"
            value={businessData.accountHolder}
            onChangeText={(text) => handleInputChange('accountHolder', text)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>RIB</Text>
          <TextInput
            style={styles.input}
            placeholder="Entrez le RIB"
            placeholderTextColor="#A7A9B7"
            value={businessData.rib}
            onChangeText={(text) => handleInputChange('rib', text)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email de contact *</Text>
          <TextInput
            style={styles.input}
            placeholder="Entrez l'email de contact"
            placeholderTextColor="#A7A9B7"
            value={businessData.contactEmail}
            onChangeText={(text) => handleInputChange('contactEmail', text)}
            keyboardType="email-address"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Téléphone</Text>
          <TextInput
            style={styles.input}
            placeholder="Entrez le numéro de téléphone"
            placeholderTextColor="#A7A9B7"
            value={businessData.businessTel}
            onChangeText={(text) => handleInputChange('businessTel', text)}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Site Web</Text>
          <TextInput
            style={styles.input}
            placeholder="Entrez l'adresse du site web"
            placeholderTextColor="#A7A9B7"
            value={businessData.website}
            onChangeText={(text) => handleInputChange('website', text)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Adresse</Text>
          <TextInput
            style={styles.input}
            placeholder="Entrez l'adresse"
            placeholderTextColor="#A7A9B7"
            value={businessData.address}
            onChangeText={(text) => handleInputChange('address', text)}
          />
        </View>

        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Sauvegarder</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#fff",
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  menuContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: "#1B2128",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    height: 40,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  submitButton: {
    width: 224,
    height: 40,
    borderRadius: 5.4,
    backgroundColor: "#877DAB",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 20,
  },
  submitButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
});

export default BusinessInfo;