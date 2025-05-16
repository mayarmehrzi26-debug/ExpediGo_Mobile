import { Ionicons } from "@expo/vector-icons";
import ImagePicker from "expo-image-picker";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import React, { useState } from "react";
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
    View,
} from "react-native";
import { firebasestore } from "../FirebaseConfig";

interface AjoutProdProps {
  navigation: any;
}

const AjoutProd: React.FC<AjoutProdProps> = ({ navigation }) => {
  const [productName, setProductName] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission nécessaire",
        "Nous avons besoin de votre permission pour accéder à la galerie",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();

    const storage = getStorage();
    const filename = `products/${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const storageRef = ref(storage, filename);

    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  const handleSubmit = async () => {
    if (!productName || !amount || !description) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    try {
      setLoading(true);
      let imageUrl = null;

      if (image) {
        imageUrl = await uploadImage(image);
      }

      await addDoc(collection(firebasestore, "products"), {
        name: productName,
        amount: parseFloat(amount.replace(",", ".")),
        description,
        imageUrl,
        createdAt: serverTimestamp(),
      });

      Alert.alert("Succès", "Produit ajouté avec succès", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Erreur lors de l'ajout du produit:", error);
      Alert.alert(
        "Erreur",
        "Une erreur s'est produite lors de l'ajout du produit",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajouter un produit</Text>
        <View style={styles.backButton} /> {/* Empty view for spacing */}
      </View>

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image }} style={styles.selectedImage} />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Ionicons
                  name="cloud-upload-outline"
                  size={50}
                  color="#A7A9B7"
                />
                <Text style={styles.uploadText}>Ajouter une photo</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nom de produit</Text>
            <TextInput
              style={styles.input}
              placeholder="Veuillez entrer le nom du produit"
              placeholderTextColor="#A7A9B7"
              value={productName}
              onChangeText={setProductName}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Montant</Text>
            <Text style={styles.helperText}>
             
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Veuillez entrer le montant"
              placeholderTextColor="#A7A9B7"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Information additionnelle</Text>
            <TextInput
              style={styles.input}
              placeholder="Description du produit"
              placeholderTextColor="#A7A9B7"
              multiline
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Créer un produit</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 51,
    paddingBottom: 14,
  },
  backButton: {
    width: 46,
    height: 47,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#27251F",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  imageUpload: {
    alignSelf: "center",
    width: 220,
    height: 172,
    marginBottom: 48,
    borderRadius: 17,
    borderWidth: 1.7,
    borderStyle: "dashed",
    borderColor: "#A7A9B7",
    overflow: "hidden",
  },
  uploadPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadText: {
    marginTop: 10,
    color: "#A7A9B7",
    fontSize: 16,
  },
  selectedImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    color: "#27251F",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 15,
  },
  helperText: {
    color: "#A7A9B7",
    fontSize: 9,
    fontWeight: "500",
    marginBottom: 14,
    lineHeight: 13,
  },
  input: {
    height: 42,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#A7A9B7",
    fontSize: 11,
    color: "#27251F",
  },
  submitButton: {
    width: 224,
    height: 37,
    borderRadius: 5.4,
    backgroundColor: "#54E598",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 40,
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "800",
  },
});

export default AjoutProd;
