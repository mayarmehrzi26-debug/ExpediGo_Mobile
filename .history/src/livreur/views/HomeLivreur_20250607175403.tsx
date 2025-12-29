import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { firebaseAuth } from '../../FirebaseConfig';

const HomeLivreur: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Observer l'état d'authentification
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      
      if (user) {
        console.log('Utilisateur connecté:', user.uid);
        // Enregistrer le token FCM pour cet utilisateur
        registerForPushNotificationsAsync(user.uid);
      } else {
        console.log('Aucun utilisateur connecté');
        // Rediriger vers l'écran de connexion si nécessaire
        // navigation.navigate('Login');
      }
    });

    return unsubscribe; // Nettoyer l'abonnement
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(firebaseAuth);
      console.log('Déconnexion réussie');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {cameraVisible ? (
        <BarcodeScanner onClose={toggleCamera} />
      ) : (
        <>
          {/* --- Header fixe --- */}
          <View style={styles.headerContainer}>
            <Image
              source={require('../../../assets/expedigo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <TouchableOpacity onPress={toggleCamera}>
              <MaterialIcons
                name="qr-code-scanner"
                size={24}
                color="#F7F7F7"
                style={{ marginLeft: 200 }}
              />
            </TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color="#F7F7F7" />
          </View>
  
          {/* --- Titre et Filtres (fixes aussi) --- */}
          <View style={styles.fixedTopSection}>
            <Animated.Text style={[styles.animatedText, { opacity: fadeAnim }]}>
              Nouvelles commandes
            </Animated.Text>
  
            <View style={styles.filterContainer}>
              <TouchableOpacity
                style={[styles.filterButton, selectedType === 'livraison' && styles.activeButton]}
                onPress={() => setSelectedType('livraison')}
              >
                <Text style={styles.filterText}>Livraison</Text>
              </TouchableOpacity>
  
              <TouchableOpacity
                style={[styles.filterButton, selectedType === 'emballage' && styles.activeButton]}
                onPress={() => setSelectedType('emballage')}
              >
                <Text style={styles.filterText}>Emballage</Text>
              </TouchableOpacity>
            </View>
          </View>
  
          {/* --- Liste scrollable --- */}
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {commandes.map((commande) => (
              <View key={commande.id} style={styles.commandeCard}>
                {commande.type === 'livraison' ? (
                  <CardCommande
                    commande={commande}
                    onRefresh={loadCommandes}
                  />
                ) : (
                  <CardEmballage
                    emballage={commande}
                    onRefresh={loadCommandes}
                  />
                )}
              </View>
            ))}
          </ScrollView>
  
          <NavBottomLiv />
        </>
      )}
    </View>
  );
  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#877DAB",
    paddingTop: 8,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: "#F7F7F7",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 40,
  },
  logo: {
    width: 130,
    height: 60,
  },
  fixedTopSection: {
    backgroundColor: '#F7F7F7',
    borderTopRightRadius: 53,
    borderTopLeftRadius: 53,
    paddingBottom: 8,
  },
  
  animatedText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#877DAB',
    textAlign: 'center',
    marginTop: 32,
  },
  commandeCard: {
    marginHorizontal: 16,
    marginTop: 10,
  },
  livrerButton: {
    backgroundColor: '#877DAB',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  livrerText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 10,
    backgroundColor: '#E0D6FF',
  },
  activeButton: {
    backgroundColor: '#877DAB',
  },
  filterText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default HomeLivreur;