import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator
} from "react-native";
import Header from "../../../src/components/Header";
import { ProductListPresenter } from "../presenter/ProductListPresenter";

const ProductListView = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [presenter] = useState(new ProductListPresenter({
    displayProducts: (products) => {
      setProducts(products);
      setLoading(false);
    },
    showError: (message) => {
      Alert.alert("Erreur", message);
      setLoading(false);
    },
    showSuccess: (message) => Alert.alert("Succès", message),
  }));

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      presenter.loadProducts();
    });
    return unsubscribe;
  }, [navigation]);

  const handleEdit = (product) => {
    navigation.navigate('EditProduct', { product });
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Confirmer la suppression",
      "Êtes-vous sûr de vouloir supprimer ce produit?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", onPress: () => presenter.deleteProduct(id) },
      ]
    );
  };

  const renderProductItem = ({ item }) => (
    <View style={styles.productCard}>
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.amount} TND</Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => handleEdit(item)}
        >
          <Ionicons name="pencil" size={20} color="#4CAF50" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons name="trash" size={20} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#574599" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Mes Produits" showBackButton={true} />

      {products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucun produit trouvé</Text>
          <Text style={styles.emptySubText}>Créez votre premier produit</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AjoutProd')}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    padding: 10,
  },
  listContent: {
    paddingBottom: 20,
  },
  productCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#27251F",
  },
  productPrice: {
    fontSize: 14,
    color: "#877DAB",
    marginVertical: 3,
  },
  productDescription: {
    fontSize: 12,
    color: "#959595",
  },
  actions: {
    flexDirection: "row",
    marginLeft: 10,
  },
  editButton: {
    padding: 8,
    marginRight: 5,
  },
  deleteButton: {
    padding: 8,
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#877DAB",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#27251F",
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: "#A7A9B7",
  },
});

export default ProductListView;