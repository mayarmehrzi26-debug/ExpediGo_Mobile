import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";

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
import { firebasestore } from "../FirebaseConfig";
import CustomDropdown from "../src/components/CustomDropdown";
import Header from "../src/components/Header";

// Définition des types pour les options du dropdown
interface Option {
  label: string;
  value: string;
}

const AddTicket: React.FC<{ route: any }> = ({ route }) => {
  const { refreshTickets } = route.params || {};

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedBord, setSelectedBord] = useState<string | null>(null);
  const [titre, setTitre] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [bordOptions, setBordOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const TypeOptions: Option[] = [
    { label: "Standard", value: "Standard" },
    { label: "Retard de livraison", value: "Retard de livraison" },
    { label: "Changer le prix du colis", value: "Changer le prix du colis" },
  ];

  const ServiceOptions: Option[] = [
    { label: "Service Commercial", value: "Commercial" },
    { label: "Service Technique", value: "Technique" },
  ];

  useEffect(() => {
    const fetchOrderIds = async () => {
      try {
        const querySnapshot = await getDocs(collection(firebasestore, "Orders"));
        const orders = querySnapshot.docs.map((doc) => ({
          label: doc.id,
          value: doc.id,
        }));
        setBordOptions(orders);
      } catch (error) {
        console.error("Erreur lors de la récupération des orderId :", error);
      }
    };

    fetchOrderIds();
  }, []);

  const generateNumericId = async (): Promise<number> => {
    const counterRef = doc(firebasestore, "counters", "ticketCounter");
    const counterDoc = await getDoc(counterRef);

    if (counterDoc.exists()) {
      const lastId = counterDoc.data().lastId;
      const newId = lastId + 1;
      await updateDoc(counterRef, { lastId: newId });
      return newId;
    } else {
      await setDoc(counterRef, { lastId: 1 });
      return 1;
    }
  };

  const handleAddTicket = async () => {
    if (!selectedType || !selectedBord) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    if (selectedType === "Standard" && (!titre || !description || !selectedService)) {
      alert("Veuillez remplir tous les champs supplémentaires pour le type Standard.");
      return;
    }

    setLoading(true);

    const numericId = await generateNumericId();
    const ticketData = {
      id: numericId,
      type: selectedType,
      bordereau: selectedBord,
      titre: selectedType === "Standard" ? titre : null,
      description: selectedType === "Standard" ? description : null,
      service: selectedType === "Standard" ? selectedService : null,
      createdAt: new Date(),
    };

    try {
      await addDoc(collection(firebasestore, "tickets"), ticketData);
      alert("Ticket ajouté avec succès !");
      if (refreshTickets) refreshTickets();
      // Reset
      setSelectedType(null);
      setSelectedBord(null);
      setTitre("");
      setDescription("");
      setSelectedService(null);
    } catch (error) {
      console.error("Erreur lors de l'ajout du ticket :", error);
      alert("Une erreur s'est produite.");
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
            options={TypeOptions}
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
                options={ServiceOptions}
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

export default AddTicket;
