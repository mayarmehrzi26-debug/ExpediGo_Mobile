import { useNavigation } from "@react-navigation/native";
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { firebaseAuth } from "../../FirebaseConfig";
import Header from "../../src/components/Header";

const InfoPerso: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // États pour les champs du formulaire
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [photoURL, setPhotoURL] = useState("https://avatar.iran.liara.run/public/77");

  useEffect(() => {
    const fetchUserData = async () => {
      const user = firebaseAuth.currentUser;
      if (user) {
        const db = getFirestore();
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Mettre à jour les états avec les données de l'utilisateur
            setFirstName(userData.nom || "");
            setEmail(user.email || "");
            setPhone(userData.phone || "");
            setPhotoURL(user.photoURL || "https://avatar.iran.liara.run/public/77");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          Alert.alert("Erreur", "Impossible de charger les données du profil");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, []);

  const handleSave = async () => {
    const user = firebaseAuth.currentUser;
    if (!user) {
      Alert.alert("Erreur", "Utilisateur non connecté");
      return;
    }

    if (!firstName || !phone || !email) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires");
      return;
    }

    setSaving(true);
    const db = getFirestore();

    try {
      // Mettre à jour les données dans Firestore
      await updateDoc(doc(db, "users", user.uid), {
        firstName,
        phone,
        updatedAt: new Date().toISOString()
      });

      // Vous pouvez aussi mettre à jour l'email dans Firebase Auth si nécessaire
      // Note: Changer l'email nécessite une re-vérification
      // await user.updateEmail(email);

      Alert.alert("Succès", "Profil mis à jour avec succès");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Erreur", "Une erreur est survenue lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Informations Personnelles" showBackButton={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#877DAB" />
          <Text>Chargement des données...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Informations Personnelles" showBackButton={true} />
      <View style={styles.profileContainer}>
        <Image
          source={{ uri: photoURL }}
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>{firstName} {lastName}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.menuContainer}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Nom</Text>
          <TextInput
            style={styles.input}
            placeholder="Entrez votre prénom"
            placeholderTextColor="#A7A9B7"
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>

       

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            placeholder="Entrez votre email"
            placeholderTextColor="#A7A9B7"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            editable={false} // L'email est souvent non modifiable directement
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Téléphone</Text>
          <TextInput
            style={styles.input}
            placeholder="Entrez votre numéro"
            placeholderTextColor="#A7A9B7"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
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
    </View>
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
    paddingBottom: 20,
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
  disabledInput: {
    backgroundColor: "#f0f0f0",
    color: "#666",
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

export default InfoPerso;