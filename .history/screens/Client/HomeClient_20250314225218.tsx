import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { firebasestore } from '../../FirebaseConfig';

const HomeClient: React.FC = () => {
  const navigation = useNavigation();
  const [trackingCode, setTrackingCode] = useState('');

  const searchDelivery = async () => {
    if (!trackingCode) {
      Alert.alert("Erreur", "Veuillez entrer un code de suivi.");
      return;
    }

    try {
      const deliveryQuery = await getDocs(
        query(collection(firebasestore, "livraisons"), where("trackingCode", "==", trackingCode))
      );
      if (!deliveryQuery.empty) {
        const deliveryDoc = deliveryQuery.docs[0];
        navigation.navigate('PackageDetails', { trackingCode });
      } else {
        Alert.alert("Erreur", "Aucune livraison trouvée avec ce code.");
      }
    } catch (error) {
      console.error("Erreur lors de la recherche de la livraison :", error);
      Alert.alert("Erreur", "Une erreur s'est produite lors de la recherche.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Entrez le code de suivi..."
          placeholderTextColor="#A7A9B7"
          value={trackingCode}
          onChangeText={setTrackingCode}
        />
        <TouchableOpacity style={styles.searchButton} onPress={searchDelivery}>
          <Ionicons name="search" size={20} color="#A7A9B7" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#44076a",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 35,
    paddingHorizontal: 15,
    marginHorizontal: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#27251F",
  },
  searchButton: {
    padding: 10,
  },
});

export default HomeClient;