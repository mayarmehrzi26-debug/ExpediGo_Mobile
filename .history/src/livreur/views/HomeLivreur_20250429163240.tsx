// 1. Nouveau composant CardEmballage.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

interface CardProps {
  commande: any;
  onRefresh: () => void;
  onPressLivrer: () => void;
}

const CardEmballage: React.FC<CardProps> = ({ commande, onRefresh, onPressLivrer }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Emballage {commande.id}</Text>
      <Text>Origine : {commande.origin}</Text>
      <Text>Destination : {commande.destination}</Text>
      <View style={styles.dateContainer}>
        <MaterialIcons name="date-range" size={16} color="black" />
        <Text style={{ marginLeft: 4 }}>{commande.date}</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={onPressLivrer}>
        <Text style={styles.buttonText}>Je livre</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF4E6",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    marginHorizontal: 22,
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 4,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  button: {
    backgroundColor: "#F4A261",
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default CardEmballage;

// 2. Code modifié de HomeLivreur.tsx

import CardEmballage from '../components/CardEmballage';

...
const [commandes, setCommandes] = useState<any[]>([]);
const [filtre, setFiltre] = useState<'livraison' | 'emballage'>('livraison');

...
<View style={styles.buttonRow}>
  <TouchableOpacity
    style={[styles.filterButton, filtre === 'livraison' && styles.activeButton]}
    onPress={() => setFiltre('livraison')}
  >
    <Text style={styles.filterText}>Commandes de livraison</Text>
  </TouchableOpacity>
  <TouchableOpacity
    style={[styles.filterButton, filtre === 'emballage' && styles.activeButton]}
    onPress={() => setFiltre('emballage')}
  >
    <Text style={styles.filterText}>Commandes d'emballage</Text>
  </TouchableOpacity>
</View>

<ScrollView style={{ marginTop: 10 }}>
  {commandes
    .filter((cmd) => cmd.type === filtre)
    .map((commande) =>
      commande.type === 'livraison' ? (
        <CardCommande
          key={commande.id}
          commande={commande}
          onRefresh={loadCommandes}
        />
      ) : (
        <CardEmballage
          key={commande.id}
          commande={commande}
          onRefresh={loadCommandes}
          onPressLivrer={async () => {
            await updateCommandeStatus(commande.id, commande.type);
            loadCommandes();
          }}
        />
      )
    )}
</ScrollView>

...

// Ajout styles :
buttonRow: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  marginHorizontal: 22,
  marginTop: 10,
},
filterButton: {
  backgroundColor: '#ddd',
  padding: 10,
  borderRadius: 10,
},
activeButton: {
  backgroundColor: '#877DAB',
},
filterText: {
  color: 'white',
  fontWeight: 'bold',
},
