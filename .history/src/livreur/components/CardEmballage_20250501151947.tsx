import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { firebaseAuth } from '../../../FirebaseConfig';
import { updateEmballageStatus } from '../services/EmballageService';

interface Props {
  emballage: {
    id: string;
    size: string;
    quantity: number;
    price: number;
    totalPrice: number;
    status: string;
    assignedTo?: string;
    userInfo: {
      email: string;
      displayName: string;
    };
    addressInfo: {
      fullAddress: string;
    };
    date?: string;
  };
  onRefresh: () => void;
}

const CardEmballage: React.FC<Props> = ({ emballage, onRefresh }) => {
  const user = firebaseAuth.currentUser;
  const isAssignedToMe = emballage.assignedTo === user?.uid;
  const showLivrerButton = !emballage.assignedTo || isAssignedToMe;

  // Fonction pour traduire le statut
  const getStatusText = (status: string) => {
    switch (status) {
      case 'non traité':
        return 'Non traité';
      case 'en cours':
        return 'En cours';
      case 'traité':
        return 'Traité';
      default:
        return status;
    }
  };

  const handleLivrer = async () => {
    try {
      await updateEmballageStatus(emballage.id, "en cours");
      Alert.alert("Succès", "Commande d'emballage acceptée");
      onRefresh();
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'accepter cette commande");
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardDetails}>
          <Text style={styles.orderNumber}>Commande #{emballage.id}</Text>          
          <View style={styles.detailContainer}>
            <Text style={styles.orderText}>Taille: {emballage.size}</Text>
            <Text style={styles.orderText}>Quantité: {emballage.quantity}</Text>
            <Text style={styles.orderText}>Prix total: {emballage.totalPrice.toFixed(3)} dt</Text>
            <Text style={styles.orderText}>Destination: {emballage.addressInfo.fullAddress}</Text>
            <Text style={styles.orderText}>Client: {emballage.userInfo.displayName}</Text>
            {emballage.date && <Text style={styles.orderText}>Date: {emballage.date}</Text>}
            <Text style={[
              styles.statusText,
              emballage.status === 'non traité' && styles.statusNonTraite,
              emballage.status === 'en cours' && styles.statusEnCours,
              emballage.status === 'traité' && styles.statusTraite
            ]}>
              Statut: {getStatusText(emballage.status)}
            </Text>
          </View>
        </View>
      </View>

      {showLivrerButton && emballage.status === 'non traité' && (
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleLivrer}
        >
          <Text style={styles.buttonText}>Je livre</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F1EEFF",
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderRadius: 12,
    elevation: 5,
    marginTop: 16,
    marginHorizontal: 22,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardDetails: {
    flex: 1,
  },
  orderNumber: {
    fontWeight: "bold",
    fontSize: 18,
    color: '#877DAB',
    marginBottom: 8,
  },
  detailContainer: {
    marginVertical: 8,
  },
  orderText: {
    color: "#555",
    fontSize: 14,
    marginTop: 2,
  },
  assignedText: {
    color: "#44076a",
    fontWeight: "bold",
    marginTop: 4,
  },
  statusText: {
    fontWeight: 'bold',
    marginTop: 4,
    fontSize: 14,
  },
  statusNonTraite: {
    color: '#FFA500', // Orange
  },
  statusEnCours: {
    color: '#0000FF', // Bleu
  },
  statusTraite: {
    color: '#008000', // Vert
  },
  button: {
    backgroundColor: "#877DAB",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default CardEmballage;