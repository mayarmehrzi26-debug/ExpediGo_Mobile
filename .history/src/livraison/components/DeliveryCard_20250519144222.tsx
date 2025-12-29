import { Entypo, Ionicons } from "@expo/vector-icons";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Divider, Menu } from "react-native-paper";
import { firebasestore } from "../../../FirebaseConfig";
import StatusBadge from "../../components/StatusBadge";

interface DeliveryCardProps {
  id: string;
  client: string;
  address: string;
  status: string;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  onViewDetails: (id: string, client: string, address: string) => void;
  onEditPickup: (id: string) => void;
  onCancel: (id: string) => void;
  showEditButton: boolean;
  showCancelButton: boolean;
}

const DeliveryCard: React.FC<DeliveryCardProps> = ({
  id,
  client,
  address,
  status,
  isSelected,
  onToggleSelection,
  onViewDetails,
  onEditPickup,
  onCancel,
  showEditButton,
  showCancelButton,
}) => {
  const [deliveryDetails, setDeliveryDetails] = useState<any>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  useEffect(() => {
    const fetchAdditionalDetails = async () => {
      try {
        setLoading(true);
        const deliveryDoc = await getDoc(doc(firebasestore, "livraisons", id));
        
        if (deliveryDoc.exists()) {
          const deliveryData = deliveryDoc.data();
          
          // Fetch related data only if needed
          const [productDoc, clientDoc, addressDoc] = await Promise.all([
            deliveryData.product ? getDoc(doc(firebasestore, "products", deliveryData.product)) : Promise.resolve(null),
            deliveryData.client ? getDoc(doc(firebasestore, "clients", deliveryData.client)) : Promise.resolve(null),
            deliveryData.address ? getDoc(doc(firebasestore, "adresses", deliveryData.address)) : Promise.resolve(null),
          ]);

          setDeliveryDetails({
            product: productDoc?.data()?.name || "Non spécifié",
            origin: addressDoc?.data()?.address || "Non spécifié",
            date: deliveryData.createdAt?.toDate() || new Date(),
            totalAmount: deliveryData.totalAmount || 0,
            isFragile: deliveryData.isFragile || false,
            isExchange: deliveryData.isExchange || false,
          });
        }
      } catch (error) {
        console.error("Erreur lors du chargement des détails:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdditionalDetails();
  }, [id]);

  const handleViewDetailsPress = () => {
    onViewDetails(id, client || "Client inconnu", address || "Adresse inconnue");
  };

  const handleEditPress = () => {
    closeMenu();
    onEditPickup(id);
  };

  const handleCancelPress = () => {
    closeMenu();
    onCancel(id);
  };

  if (loading) {
    return (
      <View style={[styles.card, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, isSelected && styles.selectedCard]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onToggleSelection(id)}>
          <Ionicons
            name={isSelected ? "checkbox" : "square-outline"}
            size={24}
            color={isSelected ? "#574599" : "#A7A9B7"}
          />
        </TouchableOpacity>

        <Text style={styles.idText}>#{id.substring(0, 8)}</Text>

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
            onPress={handleViewDetailsPress}
            title="Voir détails"
            titleStyle={styles.menuItemText}
          />
          
          {showEditButton && (
            <>
              <Divider style={styles.divider} />
              <Menu.Item
                onPress={handleEditPress}
                title="Modifier"
                titleStyle={styles.menuItemText}
              />
            </>
          )}
          
          {showCancelButton && (
            <>
              <Divider style={styles.divider} />
              <Menu.Item
                onPress={handleCancelPress}
                title="Annuler"
                titleStyle={[styles.menuItemText, styles.cancelText]}
              />
            </>
          )}
        </Menu>
      </View>

      <Text style={styles.clientText}>{client || "Client non spécifié"}</Text>
      
      <View style={styles.separator} />

      <View style={styles.infoRow}>
        <Text style={styles.label}>Statut:</Text>
        <StatusBadge status={status} />
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Adresse:</Text>
        <Text style={styles.value}>{address || "Non spécifié"}</Text>
      </View>

      {deliveryDetails && (
        <>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Origine:</Text>
            <Text style={styles.value}>{deliveryDetails.origin}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>
              {deliveryDetails.date.toLocaleDateString("fr-FR")}
            </Text>
          </View>

          <View style={styles.footer}>
            <View style={styles.tagsContainer}>
              {deliveryDetails.isFragile && (
                <View style={[styles.tag, styles.fragileTag]}>
                  <Text style={styles.tagText}>Fragile</Text>
                </View>
              )}
              {deliveryDetails.isExchange && (
                <View style={[styles.tag, styles.exchangeTag]}>
                  <Text style={styles.tagText}>Échange</Text>
                </View>
              )}
            </View>

            <Text style={styles.amountText}>
              {deliveryDetails.totalAmount.toFixed(2)} DT
            </Text>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
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
    borderWidth: 1,
    borderColor: "#574599",
    backgroundColor: "#F8F5FF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  idText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#574599",
    flex: 1,
    marginLeft: 12,
  },
  clientText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#27251F",
    marginBottom: 8,
  },
  separator: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    color: "#A7A9B7",
    flex: 1,
  },
  value: {
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
    marginTop: 12,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
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
  amountText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#574599",
  },
  menuContent: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 4,
  },
  menuItemText: {
    color: "#27251F",
    fontSize: 14,
  },
  cancelText: {
    color: "#EF5350",
  },
  divider: {
    backgroundColor: "#F0F0F0",
    marginVertical: 4,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    color: "#A7A9B7",
    fontSize: 14,
  },
});

export default DeliveryCard;