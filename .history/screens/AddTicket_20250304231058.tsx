import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import CustomDropdown from "../src/components/CustomDropdown";
import Header from "../src/components/Header";
import NavBottom from "../src/components/NavBottom";

const AddTicket: React.FC = () => {
  const navigation = useNavigation(); // Obtenez l'objet de navigation

  const [activeScreen, setActiveScreen] = useState("AddTicket");
  const [selectedType, setSelectedType] = useState(null);
  const [selectedBord, setSelectedBord] = useState(null);

  const [isAddMode, setIsAddMode] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const PaiementOptions = [
    { label: "Percevoir le paiement", value: "percevoir" },
    { label: "payé", value: "payé" },
  ];

  const toggleButtonMode = () => {
    setIsAddMode(!isAddMode);
    setModalVisible(!modalVisible);
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
      </ScrollView>
      <NavBottom activeScreen={activeScreen} />
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
  },
});

export default AddTicket;