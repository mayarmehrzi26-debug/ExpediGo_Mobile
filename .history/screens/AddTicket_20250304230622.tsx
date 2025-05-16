import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
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
          <Picker
            selectedValue={selectedType}
            onValueChange={(itemValue, itemIndex) =>
              setSelectedType(itemValue)
            }
          >
            <Picker.Item label="Choisir le type" value="" />
            <Picker.Item label="Type 1" value="type1" />
            <Picker.Item label="Type 2" value="type2" />
          </Picker>
        </View>
        <View style={styles.section}>
          <Picker
            selectedValue={selectedBord}
            onValueChange={(itemValue, itemIndex) =>
              setSelectedBord(itemValue)
            }
          >
            <Picker.Item label="Choisir un bordereau" value="" />
            <Picker.Item label="Bordereau 1" value="bord1" />
            <Picker.Item label="Bordereau 2" value="bord2" />
          </Picker>
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