import { Entypo, Ionicons } from "@expo/vector-icons";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Divider, Menu } from "react-native-paper";
import { firebasestore } from "../../../FirebaseConfig";
import StatusBadge from "../../components/StatusBadge";

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
  const [loading, setLoading] = useState(true);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  useEffect(() => {
    const fetchDeliveryData = async () => {
      try {
        const deliveryDoc = await getDoc(doc(firebasestore, "livraisons", id));
        const deliveryData = deliveryDoc.data();

        if (deliveryData) {
          const [productDoc, clientDoc, addressDoc] = await Promise.all([
            getDoc(doc(firebasestore, "products", deliveryData.product)),
            getDoc(doc(firebasestore, "clients", deliveryData.client)),
            getDoc(doc(firebasestore, "adresses", deliveryData.address)),
          ]);

          setDelivery({
            id: id.substring(0, 8),
            client: clientDoc.data()?.name || "Client inconnu",
            origine: clientDoc.data()?.name || "Client inconnu",

            product: productDoc.data()?.name || "Produit inconnu",
            address: addressDoc.data()?.address || "Adresse inconnue",
            status: deliveryData.status || "En attente",
            date: deliveryData.createdAt?.toDate() || new Date(),
            totalAmount: deliveryData.totalAmount || 0,
            isFragile: deliveryData.isFragile || false,
            isExchange: deliveryData.isExchange || false,
          });
        }
      } catch (error) {
        console.error(`Erreur lors de la récupération de la livraison ${id}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveryData();
  }, [id]);

  const handleCancel = async () => {
    try {
      await updateDoc(doc(firebasestore, "livraisons", id), {
        status: "Annulée",
      });
      setDelivery((prev: any) => ({ ...prev, status: "Annulée" }));
    } catch (error) {
      console.error("Erreur lors de l'annulation:", error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.deliveryCard, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Chargement en cours...</Text>
      </View>
    );
  }

  if (!delivery) {
    return (
      <View style={[styles.deliveryCard, styles.errorContainer]}>
        <Text style={styles.errorText}>Impossible de charger la livraison</Text>
      </View>
    );
  }

  const canEditOrCancel = delivery.status === "Non traité" || delivery.status === "En attente d'enlèvement";

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
          {canEditOrCancel && (
            <>
              <Divider style={styles.menuDivider} />
              <Menu.Item
                onPress={() => {
                  closeMenu();
                  onEditPickup(id);
                }}
                title="Modifier"
                titleStyle={styles.menuItemText}
              />
              <Divider style={styles.menuDivider} />
              <Menu.Item
                onPress={() => {
                  closeMenu();
                  handleCancel();
                }}
                title="Annuler"
                titleStyle={styles.menuItemText}
              />
            </>
          )}
        </Menu>
      </View>

      <Text style={styles.deliveryClient}>{delivery.client}</Text>

      <View style={styles.separator} />

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Statut:</Text>
        <StatusBadge status={delivery.status} />
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Adresse:</Text>
        <Text style={styles.infoValue}>{delivery.address}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Date:</Text>
        <Text style={styles.infoValue}>{delivery.date.toLocaleDateString("fr-FR")}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.tagsContainer}>
          {delivery.isFragile && (
            <View style={[styles.tag, styles.fragileTag]}>
              <Text style={styles.tagText}>Fragile</Text>
            </View>
          )}
          {delivery.isExchange && (
            <View style={[styles.tag, styles.exchangeTag]}>
              <Text style={styles.tagText}>Échange</Text>
            </View>
          )}
        </View>

        <Text style={styles.totalAmount}>{delivery.totalAmount} DT</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  deliveryCard: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  selectedCard: {
    borderWidth: 1,
    borderColor: "#574599",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  deliveryId: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#574599",
    flex: 1,
    marginLeft: 10,
  },
  deliveryClient: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#27251F",
    marginBottom: 4,
  },
  deliveryProduct: {
    fontSize: 14,
    color: "#A7A9B7",
    marginBottom: 12,
  },
  separator: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#A7A9B7",
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: "#27251F",
    fontWeight: "500",
    flex: 2,
    textAlign: "right",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  tagsContainer: {
    flexDirection: "row",
  },
  tag: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  fragileTag: {
    backgroundColor: "#FFF3E0",
  },
  exchangeTag: {
    backgroundColor: "#F3E5F5",
  },
  tagText: {
    fontSize: 12,
    fontWeight: "500",
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#574599",
  },
  menuContent: {
    backgroundColor: "#FFF",
    borderRadius: 8,
  },
  menuItemText: {
    color: "#27251F",
    fontSize: 14,
  },
  menuDivider: {
    backgroundColor: "#F0F0F0",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    color: "#A7A9B7",
    fontSize: 14,
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    borderColor: "#EF5350",
    borderWidth: 1,
  },
  errorText: {
    color: "#EF5350",
    fontSize: 14,
  },
});

export default DeliveryCard;