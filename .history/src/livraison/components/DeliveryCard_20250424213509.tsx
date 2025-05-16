import { Entypo, Ionicons } from "@expo/vector-icons";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { Divider, Menu } from "react-native-paper";
import { firebasestore } from "../../../FirebaseConfig";

interface DeliveryCardProps {
  id: string;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  onViewDetails: (id: string) => void;
  onEditPickup: (id: string) => void;
}

const DeliveryCard: React.FC<DeliveryCardProps> = ({
  id,
  isSelected,
  onToggleSelection,
  onViewDetails,
  onEditPickup,
}) => {
  const [delivery, setDelivery] = useState<any>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const fetchDelivery = async () => {
    const docRef = doc(firebasestore, "livraisons", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setDelivery({ id: docSnap.id, ...docSnap.data() });
    }
  };

  useEffect(() => {
    fetchDelivery();
  }, []);

  const isEditable =
    delivery?.status === "Non traité" || delivery?.status === "En attente d'enlèvement";

  const handleCancelDelivery = () => {
    Alert.alert(
      "Confirmation",
      "Voulez-vous vraiment annuler cette livraison ?",
      [
        {
          text: "Non",
          style: "cancel",
        },
        {
          text: "Oui",
          onPress: async () => {
            try {
              await updateDoc(doc(firebasestore, "livraisons", id), {
                status: "Annulée",
              });
              setDelivery((prev: any) => ({
                ...prev,
                status: "Annulée",
              }));
              closeMenu();
            } catch (error) {
              console.error("Erreur lors de l'annulation :", error);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  if (!delivery) return null;

  return (
    <View style={[styles.deliveryCard, isSelected && styles.selectedCard]}>
      <View style={styles.cardHeader}>
        <TouchableOpacity onPress={() => onToggleSelection(id)}>
          <Ionicons
            name={isSelected ? "checkbox" : "square-outline"}
            size={24}
            color={isSelected ? "#574599" : "#A7A9B7"}
          />
        </TouchableOpacity>

        <Text style={styles.deliveryId}>#{delivery.id}</Text>

        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={
            <TouchableOpacity onPress={openMenu}>
              <Entypo name="dots-three-vertical" size={20} color="#A7A9B7" />
            </TouchableOpacity>
          }
          contentStyle={styles.menuContent}
        >
          <Menu.Item
            onPress={() => {
              closeMenu();
              onViewDetails(id);
            }}
            title="Voir détails"
            titleStyle={styles.menuItemText}
          />
          <Divider style={styles.menuDivider} />

          {isEditable && (
            <>
              <Menu.Item
                onPress={() => {
                  closeMenu();
                  onEditPickup(id);
                }}
                title="Modifier"
                titleStyle={styles.menuItemText}
              />
              <Menu.Item
                onPress={handleCancelDelivery}
                title="Annuler"
                titleStyle={[styles.menuItemText, { color: "red" }]}
              />
            </>
          )}
        </Menu>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.detailSection}>
          <Text style={styles.label}>Pickup:</Text>
          <Text style={styles.value}>{delivery.pickup?.adresse}</Text>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.label}>Destinataire:</Text>
          <Text style={styles.value}>{delivery.destinataire?.nom}</Text>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.label}>Produit:</Text>
          <Text style={styles.value}>{delivery.produit?.nom}</Text>
        </View>

        <View style={styles.statusSection}>
          <Text style={styles.label}>Statut:</Text>
          <Text style={styles.statusValue}>{delivery.status}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  deliveryCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCard: {
    borderColor: "#574599",
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deliveryId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#574599",
  },
  menuContent: {
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  menuItemText: {
    fontSize: 14,
    color: "#333",
  },
  menuDivider: {
    marginVertical: 4,
  },
  cardContent: {
    marginTop: 12,
  },
  detailSection: {
    marginBottom: 6,
  },
  statusSection: {
    marginTop: 8,
  },
  label: {
    fontWeight: "600",
    color: "#555",
  },
  value: {
    color: "#333",
  },
  statusValue: {
    color: "#574599",
    fontWeight: "bold",
  },
});

export default DeliveryCard;
