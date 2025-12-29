import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { getAuth } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootStackParamList } from '../../NavigationTypes';
import Header from "../../src/components/Header";
import { LivraisonModel } from '../livraison/models/LivraisonModel';
import { CommandesPresenter } from '../livraison/presenters/CommandesPresenter';

type CommandeDetailsRouteProp = RouteProp<RootStackParamList, 'CommandeDetails'>;

interface CommandeDetailsProps {
  route: CommandeDetailsRouteProp;
  navigation: StackNavigationProp<RootStackParamList, 'CommandeDetails'>;
}

interface CommandeDetailsData {
  id: string;
  origin: string;
  destination: string;
  expediteurName: string;
  expediteurPhone: string;
  status: string;
  payment: string;
  isFragile: boolean;
  createdAt: Date;
  totalAmount: number;
  livreur: string;
  livreurPhone: string;
  assignedTo: string;
  products: Array<{
    name: string;
    description: string;
    quantity: number;
    price: number;
  }>;
}

const CommandeDetails: React.FC<CommandeDetailsProps> = ({ route, navigation }) => {
  const { commandeId } = route.params;
  const [commande, setCommande] = useState<CommandeDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const presenter = new CommandesPresenter();
  const model = new LivraisonModel();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchCommandeDetails = async () => {
      try {
        setLoading(true);
        const commandeDetails = await presenter.fetchCommandeDetails(commandeId);
        
        if (!commandeDetails) {
          console.log('Commande non trouvée');
          return;
        }

        // Récupération des produits ici
        const products = await presenter.fetchProducts(commandeId); // Assurez-vous que cette méthode existe

        setCommande({
          id: commandeId,
          ...commandeDetails,
          products: products || [], // Ajoutez la liste des produits ici
        });
      } catch (err) {
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchCommandeDetails();
  }, [commandeId, presenter]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#44076a" />
      </View>
    );
  }

  if (!commande) {
    return (
      <View style={styles.container}>
        <Header title="Détails de commande" showBackButton={true} />
        <View style={styles.noDetailsContainer}>
          <Text style={styles.noDetailsText}>Aucun détail trouvé pour cette commande</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Détails de commande" showBackButton={true} />
      
      <View style={styles.packageImageContainer}>
        <Image 
          source={require("../../assets/image3.png")}
          style={styles.packageImage} 
          resizeMode="contain"
        />
      </View>

      <ScrollView>
        <View style={styles.card}>
          {/* Affichage des informations de l'expéditeur et du livreur */}
          <View style={styles.contactSection}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.sectionTitle}>{commande.expediteurName}</Text>
                <Text style={styles.descriptionText}>Expéditeur</Text>
              </View>
              <View style={styles.contactButtons}>
                <TouchableOpacity style={styles.contactButton} onPress={() => {/* Handle message */}}>
                  <Icon name="message-text" size={20} color="#44076a" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.contactButton} onPress={() => Linking.openURL(`tel:${commande.expediteurPhone}`)}>
                  <Icon name="phone" size={20} color="#44076a" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Affichage des produits */}
          <View style={styles.productSection}>
            <Text style={styles.sectionTitle}>Produits</Text>
            {commande.products.map((product, index) => (
              <View key={index} style={styles.productInfo}>
                <Text style={styles.productNameText}>{product.name}</Text>
                <Text style={styles.productDescription}>{product.description}</Text>
                <Text style={styles.productQuantity}>Quantité: {product.quantity}</Text>
                <Text style={styles.productPrice}>Prix: {product.price * product.quantity} DT</Text>
              </View>
            ))}
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

// Les styles restent identiques à ceux que vous avez fournis
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
  packageImageContainer: {
    alignItems: 'center',
    paddingVertical: 16,
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
  detailsContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666666',
  },
  detailValue: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
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
  noDetailsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    margin: 20,
    alignItems: 'center',
  },
  noDetailsText: {
    fontSize: 16,
    color: '#666666',
  },
  packageImage: {
    width: 270,
    height: 200,
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
  contactButtonText: {
    marginLeft: 8,
    color: '#44076a',
    fontWeight: '500',
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

export default CommandeDetails;