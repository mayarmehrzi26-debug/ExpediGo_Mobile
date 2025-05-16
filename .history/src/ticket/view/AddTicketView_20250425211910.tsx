import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CustomDropdown from "../../components/CustomDropdown";
import Header from "../../components/Header";
import { AddTicketPresenter } from "../presenters/AddTicketPresenter";
import { Option } from "./*TicketModel";

interface AddTicketProps {
  route: any;
}

const AddTicketView: React.FC<AddTicketProps> = ({ route }) => {
  const { refreshTickets } = route.params || {};
  const [presenter] = useState(new AddTicketPresenter({
    setBordOptions: (options) => setBordOptions(options),
    showError: (message) => alert(message),
    showSuccess: (message) => alert(message),
    resetForm: () => {
      setSelectedType(null);
      setSelectedBord(null);
      setTitre("");
      setDescription("");
      setSelectedService(null);
    }
  }));

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedBord, setSelectedBord] = useState<string | null>(null);
  const [titre, setTitre] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [bordOptions, setBordOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    presenter.loadBordOptions();
  }, []);

  const handleAddTicket = async () => {
    if (!presenter.validateForm(selectedType, selectedBord, titre, description, selectedService)) {
      return;
    }

    setLoading(true);
    try {
      await presenter.handleAddTicket(
        selectedType!,
        selectedBord!,
        titre,
        description,
        selectedService,
        refreshTickets
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Ajouter un nouveau ticket" showBackButton={true} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <CustomDropdown
            placeholder="Choisir le type"
            options={presenter.getTypeOptions()}
            onSelect={setSelectedType}
            selectedValue={selectedType}
          />
        </View>
        <View style={styles.section}>
          <CustomDropdown
            placeholder="Choisir un bordereau"
            options={bordOptions}
            onSelect={setSelectedBord}
            selectedValue={selectedBord}
          />
        </View>

        {selectedType === "Standard" && (
          <>
            <View style={styles.section}>
              <TextInput
                style={styles.input}
                placeholder="Titre"
                value={titre}
                onChangeText={setTitre}
              />
            </View>
            <View style={styles.section}>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
                multiline
              />
            </View>
            <View style={styles.section}>
              <CustomDropdown
                placeholder="Sélectionner un service"
                options={presenter.getServiceOptions()}
                onSelect={setSelectedService}
                selectedValue={selectedService}
              />
            </View>
          </>
        )}

        <TouchableOpacity style={styles.addButton} onPress={handleAddTicket} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.addButtonText}>Ajouter un ticket</Text>
          )}
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
    backgroundColor: "#877DAB",
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

export default AddTicketView;