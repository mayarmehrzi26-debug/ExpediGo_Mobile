import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
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
import { EditProductPresenter } from "../presenter/EditProductPresenter";

const EditProductView = ({ route, navigation }) => {
  const { product } = route.params;
  
  const [productName, setProductName] = useState(product.name);
  const [amount, setAmount] = useState(product.amount.toString());
  const [description, setDescription] = useState(product.description);
  const [image, setImage] = useState(product.imageUrl);
  const [loading, setLoading] = useState(false);
  
  const [presenter] = useState(new EditProductPresenter({
    setLoading: (isLoading) => setLoading(isLoading),
    showValidationError: () => Alert.alert("Erreur", "Veuillez remplir tous les champs"),
    onUpdateSuccess: () => {
      Alert.alert("Succès", "Produit modifié avec succès", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    },
    onUpdateError: (error) => {
      console.error("Erreur lors de la modification:", error);
      Alert.alert("Erreur", "Échec de la modification du produit");
    }
  }));

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission nécessaire", "Permission d'accès à la galerie requise");
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

  const handleSubmit = async () => {
    await presenter.updateProduct(
      product.id,
      productName,
      amount,
      description,
      image
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modifier le produit</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.selectedImage} />
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Ionicons name="image" size={50} color="#A7A9B7" />
              <Text style={styles.uploadText}>Changer l'image</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nom du produit</Text>
          <TextInput
            style={styles.input}
            value={productName}
            onChangeText={setProductName}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Prix (TND)</Text>
          <TextInput
            style={styles.input}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, { height: 100 }]}
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
            <Text style={styles.submitButtonText}>Enregistrer</Text>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    padding: 20,
  },
  imageUpload: {
    width: 200,
    height: 150,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: 10,
    marginBottom: 20,
    overflow: "hidden",
  },
  selectedImage: {
    width: "100%",
    height: "100%",
  },
  uploadPlaceholder: {
    alignItems: "center",
  },
  uploadText: {
    marginTop: 10,
    color: "#888",
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "#54E598",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default EditProductView;