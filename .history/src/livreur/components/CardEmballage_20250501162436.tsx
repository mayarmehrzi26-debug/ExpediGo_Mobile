import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { firebaseAuth } from '../../../FirebaseConfig';
import { updateEmballageStatus } from '../services/EmballageService';

interface Props {
  emballage: {
    id: string;
    size: string;
    quantity: number;
    totalPrice: number;
    status: string;
    addressInfo: {
      fullAddress: string;
    };
    userInfo: {
      displayName: string;
    };
    date?: string;
  };
  onRefresh: () => void;
}

const CardEmballage: React.FC<Props> = ({ emballage, onRefresh }) => {
  const navigation = useNavigation();
  const user = firebaseAuth.currentUser;

  const handleAccept = async () => {
    try {
      await updateEmballageStatus(emballage.id, "Accepté");
      Alert.alert("Succès", "Commande acceptée");
      onRefresh();
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'accepter cette commande");
    }
  };

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('EmballageDetails', { emballage })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.orderNumber}>Commande #{emballage.id}</Text>
        {/* Afficher le statut seulement si showStatus est true */}
        {emballage.showStatus !== false && (
          <Text style={[
            styles.status,
            styles[`status${emballage.status.replace(/\s/g, '')}`]
          ]}>
            {emballage.status}
          </Text>
        )}
      </View>
      
      <View style={styles.details}>
        <Text style={styles.detailText}>Client: {emballage.userInfo.displayName}</Text>
        <Text style={styles.detailText}>Adresse: {emballage.addressInfo.fullAddress}</Text>
        <Text style={styles.detailText}>Total: {emballage.totalPrice.toFixed(3)} dt</Text>
        {emballage.date && <Text style={styles.detailText}>Date: {emballage.date}</Text>}
      </View>

      {/* Afficher le bouton "Je livre" seulement si le statut est "non traité" */}
      {emballage.status === "non traité" && (
        <TouchableOpacity 
          style={styles.acceptButton}
          onPress={handleAccept}
        >
          <Text style={styles.buttonText}>Je livre</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F1EEFF",
    padding: 15,
    borderRadius: 12,
    marginVertical: 8,
    elevation: 2,
  },
  cardHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
    paddingBottom: 8,
    marginBottom: 8,
  },
  orderNumber: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#44076A',
  },
  details: {
    marginBottom: 10,
  },
  
  detailText: {
    fontSize: 14,
    color: '#555',
    marginVertical: 2,
  },
  acceptButton: {
    backgroundColor: '#877DAB',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default CardEmballage;