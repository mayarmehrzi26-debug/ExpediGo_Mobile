import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { getAuth } from 'firebase/auth';
import { addDoc,orderBy collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { firebasestore } from '../../FirebaseConfig';
import { RootStackParamList } from '../../NavigationTypes';
import Header from "../../src/components/Header";
import StatusBadge from "../../src/components/StatusBadge";

type PackageDetailsRouteProp = RouteProp<RootStackParamList, 'PackageDetails'>;

interface PackageDetailsProps {
  route: PackageDetailsRouteProp;
  navigation: StackNavigationProp<RootStackParamList, 'PackageDetails'>;
}

const PackageDetails: React.FC<PackageDetailsProps> = ({ route, navigation }) => {
  const { deliveryId } = route.params;
  const [delivery, setDelivery] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [currentChatUser, setCurrentChatUser] = useState<any>(null);
  const [exchangeDetails, setExchangeDetails] = useState<any>(null);
  const [hasExchange, setHasExchange] = useState(false);
  const [showExchangeDetailsModal, setShowExchangeDetailsModal] = useState(false);
  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchDeliveryDetails = async () => {
      try {
        const deliveryDoc = await getDoc(doc(firebasestore, 'livraisons', deliveryId));
        
        if (!deliveryDoc.exists()) {
          console.error('Livraison non trouvée');
          setLoading(false);
          return;
        }

        const deliveryData = deliveryDoc.data();
        
        // Récupération des données client
        const clientDoc = deliveryData.client ? await getDoc(doc(firebasestore, 'clients', deliveryData.client)) : null;
        const clientData = clientDoc?.exists() ? clientDoc.data() : null;

        // Récupération des données d'adresse
        const addressDoc = deliveryData.address ? await getDoc(doc(firebasestore, 'adresses', deliveryData.address)) : null;
        const addressData = addressDoc?.exists() ? addressDoc.data() : null;

        // Récupération des données du livreur
        const assignedToDoc = deliveryData.assignedTo ? await getDoc(doc(firebasestore, 'users', deliveryData.assignedTo)) : null;
        const assignedToData = assignedToDoc?.exists() ? assignedToDoc.data() : null;

        // Récupération des produits
        let productsList = [];
        if (Array.isArray(deliveryData.products)) {
          for (const productItem of deliveryData.products) {
            const productDoc = await getDoc(doc(firebasestore, 'products', productItem.productId));
            if (productDoc.exists()) {
              productsList.push({
                id: productItem.productId,
                name: productDoc.data()?.name || 'Produit inconnu',
                quantity: productItem.quantity || 1,
                price: productItem.price || productDoc.data()?.amount || 0,
                image: productDoc.data()?.imageUrl || null
              });
            }
          }
        } else if (deliveryData.product) {
          const productDoc = await getDoc(doc(firebasestore, 'products', deliveryData.product));
          if (productDoc.exists()) {
            productsList.push({
              id: deliveryData.product,
              name: productDoc.data()?.name || 'Produit inconnu',
              quantity: deliveryData.quantity || 1,
              price: deliveryData.totalAmount || productDoc.data()?.amount || 0,
              image: productDoc.data()?.imageUrl || null
            });
          }
        }

        setProducts(productsList);

        setDelivery({
          id: deliveryId,
          ...deliveryData,
          client: clientData?.name || 'Client inconnu',
          clientId: deliveryData.client,
          clientPhone: clientData?.phone || '',
          destination: clientData?.address || 'Adresse inconnue',
          address: addressData?.address || 'Adresse inconnue',
          livreur: assignedToData?.name || 'Non assigné',
          livreurPhone: assignedToData?.phone || '',
          assignedTo: deliveryData.assignedTo,
          status: deliveryData.status || 'En attente',
          payment: deliveryData.payment || 'Non spécifié',
          isExchange: deliveryData.isExchange || false,
          isFragile: deliveryData.isFragile || false,
          createdAt: deliveryData.createdAt?.toDate() || new Date(),
          totalAmount: deliveryData.totalAmount || 0,
          qrCodeUrl: deliveryData.qrCodeUrl || generateQRCode(deliveryId),
        });

        // Vérifier s'il y a des échanges pour cette commande
        if (deliveryData.isExchange) {
          await fetchExchangeDetails(deliveryId);
        }
      } catch (err) {
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveryDetails();
  }, [deliveryId]);

  const fetchExchangeDetails = async (commandeId: string) => {
    try {
      const q = query(
        collection(firebasestore, "exchanges"),
        where("commandeId", "==", commandeId),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        setExchangeDetails(snapshot.docs[0].data());
        setHasExchange(true);
      } else {
        setExchangeDetails(null);
        setHasExchange(false);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des détails d'échange:", error);
      setExchangeDetails(null);
      setHasExchange(false);
    }
  };

  const generateQRCode = (id: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?data=${id}&size=200x200`;
  };

  const handleCall = (phoneNumber: string, contactName: string) => {
    const cleanedPhoneNumber = phoneNumber.replace(/[^0-9+]/g, '');
    
    if (!cleanedPhoneNumber) {
      Alert.alert("Erreur", "Numéro de téléphone invalide");
      return;
    }

    const phoneUrl = `tel:${cleanedPhoneNumber}`;

    Linking.canOpenURL(phoneUrl).then(canOpen => {
      if (canOpen) {
        Linking.openURL(phoneUrl);
      } else {
        Alert.alert(
          "Appel non disponible",
          "Votre appareil ne peut pas passer d'appels téléphoniques"
        );
      }
    }).catch(error => {
      console.error("Erreur d'appel:", error);
      Alert.alert("Erreur", "Impossible de passer l'appel");
    });
  };

  const confirmCall = (phoneNumber: string, contactName: string) => {
    Alert.alert(
      "Confirmer l'appel",
      `Voulez-vous appeler ${contactName} au ${phoneNumber} ?`,
      [
        { text: "Annuler", style: "cancel" },
        { text: "Appeler", onPress: () => handleCall(phoneNumber, contactName) }
      ]
    );
  };

  const handleStartConversation = async (userId: string, userName: string) => {
    try {
      if (!currentUser) {
        Alert.alert("Erreur", "Vous devez être connecté pour envoyer des messages");
        return;
      }

      const participants = [currentUser.uid, userId];
      let conversationId = await findExistingConversation(participants);
      
      if (!conversationId) {
        conversationId = await createConversation(participants);
      }

      navigation.navigate('ChatScreen', { 
        conversationId,
        recipientName: userName
      });
    } catch (error) {
      console.error("Erreur lors du démarrage de la conversation:", error);
      Alert.alert("Erreur", error.message || "Impossible de démarrer la conversation");
    }
  };

  const findExistingConversation = async (participants: string[]): Promise<string | null> => {
    try {
      const q = query(
        collection(firebasestore, "conversations"),
        where("participants", "array-contains", participants[0])
      );
      
      const snapshot = await getDocs(q);
      for (const doc of snapshot.docs) {
        const data = doc.data();
        if (data.participants.includes(participants[1])) {
          return doc.id;
        }
      }
      return null;
    } catch (error) {
      console.error("Error finding conversation:", error);
      return null;
    }
  };

  const createConversation = async (participants: string[]): Promise<string> => {
    try {
      const docRef = await addDoc(collection(firebasestore, "conversations"), {
        participants,
        lastMessage: "",
        lastMessageAt: new Date(),
        createdBy: participants[0],
        createdAt: new Date(),
        status: "active"
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creating conversation:", error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentChatUser || !currentUser) return;

    try {
      const messageData = {
        text: newMessage,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || 'Utilisateur',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, messageData]);
      setNewMessage('');
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      Alert.alert("Erreur", "Impossible d'envoyer le message");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#877DAB" />
      </View>
    );
  }

  if (!delivery) {
    return (
      <View style={styles.container}>
        <Header title="Détails de colis" showBackButton={true} />
        <View style={styles.noDetailsContainer}>
          <Text style={styles.noDetailsText}>Aucun détail trouvé pour cette livraison</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header 
        title="Détails de colis" 
        showBackButton={true}
      />      
      <View style={styles.packageImageContainer}>
        <Image 
          source={require("../../assets/image3.png")}
          style={styles.packageImage} 
          resizeMode="contain"
        />
      </View>

      <ScrollView>
        <View style={styles.card}>
          <View style={styles.contactSection}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.sectionTitle}>{delivery.client}</Text>
                <Text style={styles.descriptionText}>Destinataire</Text>
              </View>
              <View style={styles.contactButtons}>
                <TouchableOpacity 
                  style={styles.contactButton}
                  onPress={() => handleStartConversation(delivery.clientId, delivery.client)}
                >
                  <Icon name="message-text" size={20} color="#877DAB" />
                </TouchableOpacity>
                {delivery.clientPhone && (
                  <TouchableOpacity 
                    style={styles.contactButton}
                    onPress={() => confirmCall(delivery.clientPhone, delivery.client)}
                  >
                    <Icon name="phone" size={20} color="#877DAB" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {delivery.status !== "Non traité" && delivery.status !== "Annulée" && delivery.livreur && (
            <View style={styles.contactSection}>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.sectionTitle}>{delivery.livreur}</Text>
                  <Text style={styles.descriptionText}>Livreur</Text>
                </View>
                <View style={styles.contactButtons}>
                  <TouchableOpacity 
                    style={styles.contactButton}
                    onPress={() => handleStartConversation(delivery.assignedTo, delivery.livreur)}
                  >
                    <Icon name="message-text" size={20} color="#877DAB" />
                  </TouchableOpacity>
                  {delivery.livreurPhone && (
                    <TouchableOpacity 
                      style={styles.contactButton}
                      onPress={() => confirmCall(delivery.livreurPhone, delivery.livreur)}
                    >
                      <Icon name="phone" size={20} color="#877DAB" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          )}

          <View style={styles.cardHeader}>
            <Text style={styles.productName}>Commande #{delivery.id.substring(0, 8)}</Text>
          </View>
          
          <View style={styles.statusBadge}>
            <StatusBadge status={delivery.status} />
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText}>
              Colis de <Text style={styles.boldText}>{delivery.address}</Text> vers{' '}
              <Text style={styles.boldText}>{delivery.destination}</Text> pour le client{' '}
              <Text style={styles.boldText}>{delivery.client}</Text>
            </Text>
            
            {(delivery.status === "En cours de pickup" || delivery.status === "En cours de livraison") && (
              <TouchableOpacity 
                style={styles.routeButton} 
                onPress={() => navigation.navigate('TrackingScreen', { 
                  deliveryId: delivery.id,
                  fromAddress: delivery.address,
                  toAddress: delivery.destination,
                  livreurId: delivery.assignedTo,
                })}
              >
                <Icon name="map-marker-path" size={16} color="#877DAB" />
                <Text style={styles.routeButtonText}>Voir l'itinéraire</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.infoBadgesContainer}>
            <View style={styles.infoBadge}>
              <Icon name="credit-card" size={16} color="#F06292" />
              <Text style={styles.infoBadgeText}>{delivery.payment}</Text>
            </View>
            <View style={styles.infoBadge}>
              <Icon name="calendar" size={16} color="#877DAB" />
              <Text style={styles.infoBadgeText}>
                {delivery.createdAt.toLocaleDateString('fr-FR')}
              </Text>
            </View>
          </View>

          <View style={styles.detailsContainer}>
            <Text style={styles.productsTitle}>Produits ({products.length})</Text>
            
            {products.map((product, index) => (
              <View key={index} style={styles.productItem}>
                {product.image && (
                  <Image 
                    source={{uri: product.image}} 
                    style={styles.productImage}
                  />
                )}
                <View style={styles.productInfo}>
                  <Text style={styles.productNameText}>{product.name}</Text>
                  <View style={styles.productDetails}>
                    <View style={styles.detailBadge}>
                      <Text style={styles.detailBadgeText}>x{product.quantity}</Text>
                    </View>
                    <View style={styles.detailBadge}>
                      <Text style={styles.detailBadgeText}>{product.price} DT/unité</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.productTotal}>
                  {product.price * product.quantity} DT
                </Text>
              </View>
            ))}
            
            {delivery.isFragile && (
              <View style={styles.detailRow}>
                <View style={styles.detailLabelContainer}>
                  <Icon name="alert-octagon" size={16} color="#EF5350" />
                  <Text style={styles.detailLabel}> Type:</Text>
                </View>
                <Text style={styles.detailValue}>Colis fragile</Text>
              </View>
            )}
            
            {delivery.isExchange && (
              <View style={styles.detailRow}>
                <View style={styles.detailLabelContainer}>
                  <Icon name="swap-horizontal" size={16} color="#877DAB" />
                  <Text style={styles.detailLabel}> Type:</Text>
                </View>
                <Text style={styles.detailValue}>Échange</Text>
              </View>
            )}
          </View>

          <View style={styles.priceQuantityContainer}>
            <View>
              <Text style={styles.priceLabel}>Montant total :</Text>
              <Text style={styles.priceValue}>{delivery.totalAmount ?? 0} dt</Text>
            </View>
          </View>

          {/* Bouton de détails d'échange */}
          {(delivery.isExchange && hasExchange) && (
            <TouchableOpacity 
              style={styles.exchangeDetailsButton}
              onPress={() => setShowExchangeDetailsModal(true)}
            >
              <Icon name="information-outline" size={20} color="#FFFFFF" />
              <Text style={styles.exchangeDetailsButtonText}>Détails d'échange</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Modal de détails d'échange */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showExchangeDetailsModal}
        onRequestClose={() => setShowExchangeDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.exchangeModalContent}>
            <Text style={styles.modalTitle}>Détails de l'échange</Text>
            
            {exchangeDetails ? (
              <>
                <View style={styles.exchangeDetailRow}>
                  <Text style={styles.exchangeDetailLabel}>Produit:</Text>
                  <Text style={styles.exchangeDetailValue}>{exchangeDetails.productName}</Text>
                </View>
                
                <View style={styles.exchangeDetailRow}>
                  <Text style={styles.exchangeDetailLabel}>Raison:</Text>
                  <Text style={styles.exchangeDetailValue}>{exchangeDetails.description}</Text>
                </View>
                
                <View style={styles.exchangeDetailRow}>
                  <Text style={styles.exchangeDetailLabel}>Statut:</Text>
                  <Text style={styles.exchangeDetailValue}>{exchangeDetails.status}</Text>
                </View>
                
                <TouchableOpacity
                  style={styles.closeExchangeButton}
                  onPress={() => setShowExchangeDetailsModal(false)}
                >
                  <Text style={styles.closeButtonText}>Fermer</Text>
                </TouchableOpacity>
              </>
            ) : (
              <ActivityIndicator size="large" color="#877DAB" />
            )}
          </View>
        </View>
      </Modal>

      {/* Modal de chat (existant) */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={chatModalVisible}
        onRequestClose={() => setChatModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Discussion avec {currentChatUser?.name}</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setChatModalVisible(false)}
            >
              <Icon name="close" size={24} color="#877DAB" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.chatArea}>
            {messages.map((msg, index) => (
              <View key={index} style={[
                styles.messageBubble,
                msg.senderId === currentUser?.uid ? styles.myMessage : styles.theirMessage
              ]}>
                <Text style={styles.senderName}>
                  {msg.senderId === currentUser?.uid ? 'Moi' : msg.senderName}
                </Text>
                <Text style={styles.messageText}>{msg.text}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.messageInputContainer}>
            <TextInput
              style={styles.messageInput}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Écrire un message..."
              multiline
            />
            <TouchableOpacity 
              style={styles.sendButton}
              onPress={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              <Icon name="send" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  packageImageContainer: {
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#F1DBF2',
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
    color: '#877DAB',
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
    backgroundColor: '#F1DBF2',
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
    color: '#574599',
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
    color: '#574599',
    fontWeight: '500',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#574599',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#F5F5F5',
  },
  productInfo: {
    flex: 1,
  },
  productNameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  productDetails: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  detailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0EBF8',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  detailBadgeText: {
    fontSize: 12,
    color: '#574599',
    marginLeft: 4,
  },
  productTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#574599',
    marginLeft: 8,
  },
  exchangeDetailsButton: {
    backgroundColor: '#877DAB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    marginHorizontal: 16,
  },
  exchangeDetailsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  exchangeModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#877DAB',
    marginBottom: 16,
    textAlign: 'center',
  },
  exchangeDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    width: '100%',
  },
  exchangeDetailLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#877DAB',
    flex: 1,
  },
  exchangeDetailValue: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  closeExchangeButton: {
    backgroundColor: '#877DAB',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    padding: 5,
  },
  chatArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
    borderTopRightRadius: 0,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ECECEC',
    borderTopLeftRadius: 0,
  },
  senderName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#555',
  },
  messageText: {
    fontSize: 16,
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 20,
    padding: 12,
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#877DAB',
    borderRadius: 20,
    padding: 10,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PackageDetails;