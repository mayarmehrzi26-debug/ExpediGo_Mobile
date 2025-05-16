import React, { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
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
 const handleSubmit = async () => {
    if (!clientName || !phoneNumber || !email || !address) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }
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
         <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
                    {loading ? <ActivityIndicator color="white" /> : <Text style={styles.submitButtonText}>Ajouter le client</Text>}
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
});

export default AddTicket;