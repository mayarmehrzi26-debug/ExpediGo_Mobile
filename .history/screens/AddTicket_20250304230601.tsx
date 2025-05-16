import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import RNPickerSelect from "react-native-picker-select";
import Header from "../src/components/Header";
import NavBottom from "../src/components/NavBottom";

const AddTicket: React.FC = () => {
  const navigation = useNavigation();

  const [activeScreen, setActiveScreen] = useState("AddTicket");
  const [selectedType, setSelectedType] = useState(null);
  const [selectedBord, setSelectedBord] = useState(null);

  const [isAddMode, setIsAddMode] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const toggleButtonMode = () => {
    setIsAddMode(!isAddMode);
    setModalVisible(!modalVisible);
  };

  return (
    <View style={styles.container}>
      <Header title="Ajouter un nouveau ticket" showBackButton={true} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <RNPickerSelect
            onValueChange={(value) => setSelectedType(value)}
            items={[
              { label: "Choisir le type", value: null },
              { label: "Type 1", value: "type1" },
              { label: "Type 2", value: "type2" },
            ]}
          />
        </View>
        <View style={styles.section}>
          <RNPickerSelect
            onValueChange={(value) => setSelectedBord(value)}
            items={[
              { label: "Choisir un bordereau", value: null },
              { label: "Bordereau 1", value: "bord1" },
              { label: "Bordereau 2", value: "bord2" },
            ]}
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