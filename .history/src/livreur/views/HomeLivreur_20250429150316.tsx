import React, { useEffect, useState, useRef } from "react";
import { View, ScrollView, StyleSheet, Animated } from "react-native";
import { fetchCommandes } from "../services/commandeService";
import CardCommande from "../components/CardCommande";

const HomeLivreur = () => {
  const [commandes, setCommandes] = useState<any[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const loadCommandes = async () => {
    const data = await fetchCommandes();
    setCommandes(data);
  };

  useEffect(() => {
    loadCommandes();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Animated.Text style={[styles.animatedText, { opacity: fadeAnim }]}>
        Nouvelles commandes
      </Animated.Text>

      {commandes.map((commande) => (
        <CardCommande key={commande.id} commande={commande} onRefresh={loadCommandes} />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
  },
  animatedText: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 16,
    textAlign: "center",
    color: "#333",
  },
});

export default HomeLivreur;
