import { useRoute } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from "../../components/Header";
import StatusBadge from "../../components/StatusBadge";
import { LivraisonModel } from '../../livraison/models/LivraisonModel';
import { CommandesPresenter } from '../../livraison/presenters/CommandesPresenter';

const CommandeDetailsScreen = ({ navigation }) => {
  const route = useRoute();
  const { commande: initialCommande } = route.params;
  const [commande, setCommande] = useState(initialCommande);
  const [loading, setLoading] = useState(false);
  const [presenter] = useState(new CommandesPresenter());
  const [model] = useState(new LivraisonModel());
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const handleSendMessage = async (participants: string[], recipientName: string) => {
    try {
      if (!currentUser) {
        console.error("Aucun utilisateur connecté");
        return;
      }

      let conversationId = await model.findExistingConversation(participants);
      
      if (!conversationId) {
        console.log("Création d'une nouvelle conversation");
        conversationId = await model.createConversation(participants);
      }

      navigation.navigate('ChatScreen', { 
        conversationId,
        recipientName
      });
    } catch (error) {
      console.error("Error starting conversation:", error);
      Alert.alert("Erreur", "Impossible de démarrer la conversation");
    }
  };

  const handleSendMessageToExpediteur = async () => {
    if (!commande?.createdBy?.id) return;
    await handleSendMessage(
      [currentUser.uid, commande.createdBy.id],
      commande.createdBy.name
    );
  };

  const handleSendMessageToLivreur = async () => {
    if (!commande?.assignedTo) return;
    await handleSendMessage(
      [currentUser.uid, commande.assignedTo],
      commande.livreurName
    );
  };

  const handleCall = (phoneNumber: string) => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`).catch(err => 
        Alert.alert("Erreur", "Impossible de passer l'appel")
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#44076a" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header 
        title="Détails de commande" 
        showBackButton={true}
      />
      
      <ScrollView>
        <View style={styles.card}>
          <View style={styles.contactSection}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.sectionTitle}>{commande.createdBy?.name || 'Expéditeur'}</Text>
                <Text style={styles.descriptionText}>Expéditeur</Text>
              </View>
              <View style={styles.contactButtons}>
                <TouchableOpacity 
                  style={styles.contactButton}
                  onPress={handleSendMessageToExpediteur}
                >
                  <Icon name="message-text" size={20} color="#44076a" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.contactButton}
                  onPress={() => handleCall(commande.createdBy?.phone)}
                >
                  <Icon name="phone" size={20} color="#44076a" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {commande.status !== "Non traité" && commande.status !== "Annulée" && (
            <View style={styles.contactSection}>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.sectionTitle}>Livreur</Text>
                  <Text style={styles.descriptionText}>{commande.livreurName || 'Non assigné'}</Text>
                </View>
                <View style={styles.contactButtons}>
                  <TouchableOpacity 
                    style={styles.contactButton}
                    onPress={handleSendMessageToLivreur}
                  >
                    <Icon name="message-text" size={20} color="#44076a" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.contactButton}
                    onPress={() => handleCall(commande.livreurPhone)}
                  >
                    <Icon name="phone" size={20} color="#44076a" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          <View style={styles.cardHeader}>
            <Text style={styles.productName}>Commande #{commande.id.substring(0, 8)}</Text>
          </View>
          
          <View style={styles.statusBadge}>
            <StatusBadge status={commande.status} />
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText}>
              De <Text style={styles.boldText}>{commande.originAddress}</Text> vers <Text style={styles.boldText}>{commande.destination}</Text>
            </Text>
            
            {commande.status === "En attente d'enlèvement" && (
              <TouchableOpacity 
                style={styles.routeButton} 
                onPress={() => navigation.navigate('TrackingScreen', { 
                  deliveryId: commande.id,
                  fromAddress: commande.originAddress,
                  toAddress: commande.destination
                })}
              >
                <Icon name="map-marker-path" size={16} color="#44076a" />
                <Text style={styles.routeButtonText}>Voir l'itinéraire</Text>
              </TouchableOpacity>
            )}
          </View>
         
          <View style={styles.infoBadgesContainer}>
            <View style={styles.infoBadge}>
              <Icon name="credit-card" size={16} color="#44076a" />
              <Text style={styles.infoBadgeText}>{commande.payment || 'Non spécifié'}</Text>
            </View>
            <View style={styles.infoBadge}>
              <Icon name="calendar" size={16} color="#44076a" />
              <Text style={styles.infoBadgeText}>
                {commande.createdAt?.toDate().toLocaleDateString('fr-FR') || 'Date inconnue'}
              </Text>
            </View>
          </View>

          <View style={styles.productSection}>
            <Text style={styles.sectionTitle}>Produit</Text>
            <View style={styles.productInfo}>
              <Text style={styles.productNameText}>{commande.productName || 'Produit inconnu'}</Text>
              {commande.productDescription && (
                <Text style={styles.productDescription}>{commande.productDescription}</Text>
              )}
            </View>
          </View>

          <View style={styles.priceQuantityContainer}>
            <View>
              <Text style={styles.priceLabel}>Montant total :</Text>
              <Text style={styles.priceValue}>{commande.totalAmount ?? 0} dt</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#877DAB',
  },
  container: {
    flex: 1,
    backgroundColor: '#877DAB',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    paddingTop: 32,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  statusBadge: {
    alignSelf: 'flex-end',
    marginBottom: 5
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666666',
  },
  boldText: {
    fontWeight: 'bold',
    color: '#333333',
  },
  routeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  routeButtonText: {
    fontSize: 14,
    color: '#44076a',
    marginLeft: 8,
    fontWeight: '500',
  },
  infoBadgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 6,
    marginBottom: 8,
  },
  infoBadgeText: {
    fontSize: 14,
    color: '#333333',
    marginLeft: 8,
  },
  priceQuantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666666',
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  contactSection: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    marginHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#44076a',
    marginBottom: 12,
  },
  contactButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  contactButton: {
    backgroundColor: '#F0EBF8',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productSection: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between', 
    alignItems: 'center',            
  },
  productInfo: {
    marginTop: 0,                     
    alignItems: 'flex-end',          
  },
  productNameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});

export default CommandeDetailsScreen;