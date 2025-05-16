import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import CustomDropdown from "../src/components/CustomDropdown";
import Header from "../src/components/Header";

const AddTicket: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedBord, setSelectedBord] = useState<string | null>(null);
  const [titre, setTitre] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const TypeOptions = [
    { label: "Standard", value: "Standard" },
    { label: "Retard de livraison", value: "Retard de livraison" },
    { label: "Changer le prix du colis", value: "Changer le prix du colis" },
  ];

  const BordOptions = [
    { label: "23456", value: "23456" },
    { label: "24555", value: "24555" },
  ];

  const ServiceOptions = [
    { label: "Service Commercial", value: "Commercial" },
    { label: "Service Technique", value: "Technique" },
  ];

  const handleAddTicket = () => {
    // Vérifiez que les champs obligatoires sont remplis
    if (!selectedType || !selectedBord) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    // Si le type est "Standard", vérifiez les champs supplémentaires
    if (selectedType === "Standard" && (!titre || !description || !selectedService)) {
      alert("Veuillez remplir tous les champs supplémentaires pour le type Standard.");
      return;
    }

    // Logique pour ajouter le ticket
    console.log("Type sélectionné :", selectedType);
    console.log("Bordereau sélectionné :", selectedBord);
    console.log("Titre :", titre);
    console.log("Description :", description);
    console.log("Service sélectionné :", selectedService);

    // Afficher un message de succès
    alert("Ticket ajouté avec succès !");

    // Réinitialiser les champs (optionnel)
    setSelectedType(null);
    setSelectedBord(null);
    setTitre("");
    setDescription("");
    setSelectedService(null);
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

        {/* Afficher les champs supplémentaires uniquement si le type est "Standard" */}
        {selectedType === "Standard" && (
          <>
            <View style={styles.section}>
              <TextInput
                style={styles.input}
                placeholder="Titre"
                value={titre}
                onChangeText={(text) => setTitre(text)}
              />
            </View>
            <View style={styles.section}>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Description"
                value={description}
                onChangeText={(text) => setDescription(text)}
                multiline
              />
            </View>
            <View style={styles.section}>
              <CustomDropdown
                placeholder="Sélectionner un service"
                options={ServiceOptions}
                onSelect={(value) => setSelectedService(value)}
                selectedValue={selectedService}
              />
            </View>
          </>
        )}

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
  },
  input: {
    height: 40,
    borderColor: "#A7A9B7",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: "#FFF",
  },
  multilineInput: {
    height: 100,
    textAlignVertical: "top",
  },
  addButton: {
    width: "100%",
    height: 50,
    borderRadius: 5,
    backgroundColor: "#54E598",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  addButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AddTicket;