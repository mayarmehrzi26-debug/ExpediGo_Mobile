import { Entypo } from "@expo/vector-icons"; // Pour l'icône des trois points
import { collection, getDocs, query, Timestamp } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Divider, Menu } from "react-native-paper";
import { firebasestore } from "../FirebaseConfig";
import FileExplorer from "../src/components/FileExplorer";
import FilterBar from "../src/components/FilterBar"; // Importer FilterBar
import Header from "../src/components/Header";
import NavBottom from "../src/components/NavBottom";

const Pickups: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState("Pickups");
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuVisibleForId, setMenuVisibleForId] = useState<string | null>(null); // État pour gérer le menu ouvert

  const openMenu = (id: string) => setMenuVisibleForId(id); // Ouvrir le menu pour une carte spécifique
  const closeMenu = () => setMenuVisibleForId(null); // Fermer le menu

  const extractNumericId = (id: string, length: number = 3): number => {
    const numericString = id.replace(/\D/g, "");
    const truncatedString = numericString.slice(0, length);
    return truncatedString ? parseInt(truncatedString, 10) : 0;
  };

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const q = query(collection(firebasestore, "livraisons"));
        const querySnapshot = await getDocs(q);

        const deliveriesList = await Promise.all(querySnapshot.docs.map(async (doc) => {
          const data = doc.data();

          const productSnapshot = await getDocs(collection(firebasestore, "products"));
          const productData = productSnapshot.docs.find(productDoc => productDoc.id === data.product)?.data();

          const clientSnapshot = await getDocs(collection(firebasestore, "clients"));
          const clientData = clientSnapshot.docs.find(clientDoc => clientDoc.id === data.client)?.data();

          const addressSnapshot = await getDocs(collection(firebasestore, "adresses"));
          const addressData = addressSnapshot.docs.find(addressDoc => addressDoc.id === data.address)?.data();

          const date = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toLocaleDateString() : data.date || "Date inconnue";

          const numericId = extractNumericId(doc.id);

          return {
            id: numericId,
            client: clientData?.name || "Client inconnu",
            address: addressData?.address || "Adresse inconnue",
            product: productData?.name || "Produit inconnu",
            payment: productData?.amount,
            isExchange: data.isExchange,
            isFragile: data.isFragile,
            productImage: productData?.imageUrl || null,
            date,
          };
        }));

        setDeliveries(deliveriesList);
      } catch (error) {
        console.error("Error fetching deliveries:", error);
      }
    };

    fetchDeliveries();
  }, []);

  const filteredDeliveries = deliveries.filter(delivery =>
    delivery.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
    delivery.id.toString().includes(searchQuery) // Convertir en chaîne
  );

  return (
    <View style={styles.container}>
      <Header title="Pickups" showBackButton={true} />
      <View style={styles.separator1} />

      <FilterBar deliveries={deliveries} />
      
      <FileExplorer searchQuery={searchQuery} setSearchQuery={setSearchQuery} />


      <ScrollView contentContainerStyle={styles.content}>
        {filteredDeliveries.length > 0 ? (
          filteredDeliveries.map((delivery) => (
            
            <View key={delivery.id} style={styles.deliveryCard}>
               
              <View style={styles.cardHeader}>
                
                <Text style={styles.deliveryId}>{delivery.id}</Text>
                <Menu
                  visible={menuVisibleForId === delivery.id} // Afficher le menu uniquement pour cette carte
                  onDismiss={closeMenu}
                  anchor={
                    <TouchableOpacity onPress={() => openMenu(delivery.id)}>
                      <Entypo name="dots-three-vertical" size={20} color="black"  />
                    </TouchableOpacity>
                  }
                >
                  <Menu.Item onPress={() => console.log("View details")} title="View details" />
                  <Divider />
                  <Menu.Item onPress={() => console.log("Edit pickup")} title="Edit pickup" />
                </Menu>
              </View>
              <Text style={styles.deliveryClient}>{delivery.client}</Text>
              <View style={styles.separator} />
              <View style={styles.dateContainer}>

    <Text style={styles.deliverySubtitle}>Status</Text>
    <Text style={styles.statusBadge}><Entypo name="dot-single" size={20} color="white"/>Entréeau centrale</Text>
  </View>      
    <View style={styles.dateContainer}>
    <Text style={styles.deliverySubtitle}>Destination</Text>
    <Text style={styles.deliveryValue}>{delivery.address}</Text>
  </View>              
  <View style={styles.dateContainer}>
    <Text style={styles.deliverySubtitle}>Paiement</Text>
    <Text style={styles.deliveryPayment}>{delivery.payment} DT</Text>
  </View>              
  <View style={styles.dateContainer}>
    <Text style={styles.deliverySubtitle}>Date</Text>
    <Text style={styles.deliveryValue}>{delivery.date}</Text>
  </View>              
            </View>
          ))
        ) : (
          <Text style={styles.noDeliveriesText}>Aucune livraison disponible</Text>
        )}
      </ScrollView>

      <NavBottom activeScreen={activeScreen} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  content: {
    flexGrow: 1,
    paddingTop: 0,
    padding: 20,
  },
  deliveryCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deliveryId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#27251F",
  },
  statusBadge: {
    backgroundColor: "#54E598",
    color: "#fff",
    paddingHorizontal: 9,
    borderRadius: 30,
    fontSize: 12,


  },
  fragileBadge: {
    backgroundColor: "#FF6B6B",
    color: "#fff",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    fontSize: 12,
    textAlign: "center",
    marginTop: 5,
  },
  deliveryClient: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1B2128",
    marginTop: 5,
  },
  deliverySubtitle: {
    fontSize: 14,
    color: "#A7A9B7",
    marginTop: 5,
  },
  deliveryPayment: {
    fontSize: 14,
    color: "#FD5A1E",
    fontWeight: "bold",
    marginTop: 5,
  },
  delivery: {
    fontSize: 14,
    color: "#1B2128",
    marginTop: 5,

  },
  noDeliveriesText: {
    fontSize: 16,
    color: "#A7A9B7",
    textAlign: "center",
    marginTop: 10,
  },
  separator: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 8,
  },
  separator1: {
    height: 1,
    backgroundColor: "#FD5A1E",
    marginVertical: 8,
    marginBottom: 22,
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between", // Espacer les éléments
    marginTop: 5, // Espacement par rapport au contenu précédent
  },
  deliveryValue: {
    fontSize: 14,
    color: "#1B2128",
    fontWeight: "bold", // Optionnel : pour mettre en valeur la date
  },
  

});

export default Pickups;