import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CustomDropdown from "../src/components/CustomDropdown";
import Header from "../src/components/Header";

const AddTicket: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedBord, setSelectedBord] = useState<string | null>(null);

  const TypeOptions = [
    { label: "Standard", value: "Standard" },
    { label: "Retard de livraison", value: "Retard de livraison" },
    { label: "Changer le prix du colis", value: "Changer le prix du colis" },
  ];

  const BordOptions = [
    { label: "23456", value: "23456" },
    { label: "24555", value: "24555" },
  ];

  const handleAddTicket = () => {
    // Vérifiez que les champs obligatoires sont remplis
    if (!selectedType || !selectedBord) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    // Logique pour ajouter le ticket
    console.log("Type sélectionné :", selectedType);
    console.log("Bordereau sélectionné :", selectedBord);

    // Afficher un message de succès
    alert("Ticket ajouté avec succès !");

    // Réinitialiser les champs (optionnel)
    setSelectedType(null);
    setSelectedBord(null);
  };

  return (
    <View style={styles.container}>
      <Header title="Ajouter un nouveau ticket" showBackButton={true} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <CustomDropdown
            placeholder="Choisir le type"
            options={TypeOptions}
            onSelect={(value) => setSelectedType(value)}
            selectedValue={selectedType}
          />
        </View>
        <View style={styles.section}>
          <CustomDropdown
            placeholder="Choisir un bordereau"
            options={BordOptions}
            onSelect={(value) => setSelectedBord(value)}
            selectedValue={selectedBord}
          />
        </View>

        {/* Bouton "Ajouter un ticket" */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddTicket}>
          <Text style={styles.addButtonText}>Ajouter un ticket</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  section: {
    marginBottom: 20,
    width: "100%",
    textShadowColor:"#fff"
  },
  addButton: {
    width: "100%",
    height: 50,
    borderRadius: 5,
    backgroundColor: "#54E598", // Couleur de fond du bouton
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  addButtonText: {
    color: "#FFF", // Couleur du texte
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AddTicket;