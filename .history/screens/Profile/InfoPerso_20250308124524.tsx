import { useNavigation } from "@react-navigation/native"; // Importer useNavigation depuis @react-navigation/native
import React, { useState } from "react";
import {TouchableOpacity, Image, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Header from "../../src/components/Header";
import NavBottom from "../../src/components/NavBottom";

const InfoPerso: React.FC = () => {
  const navigation = useNavigation(); // Obtenir l'objet de navigation

  const [activeScreen, setActiveScreen] = useState("Profile");
  const [modalVisible, setModalVisible] = useState(false);
  const [isAddMode, setIsAddMode] = useState(true);
  const [clientName, setClientName] = useState("");
  const [clientLastName, setClientLastName] = useState("");
const[clientEmail,setClientEmail]=useState("");
const[clientTel,setClientTel]=useState("");
const[clientMdp,setClientMdp]=useState("");

const handleSubmit = async () => {
  if (!clientName || !phoneNumber || !email || !address) {
    Alert.alert("Erreur", "Veuillez remplir tous les champs");
    return;
  }

  try {
    setLoading(true);
    await addDoc(collection(firebasestore, "clients"), {
      name: clientName,
      phone: phoneNumber,
      email,
      address,
      createdAt: serverTimestamp(),
    });

    Alert.alert("Succès", "Client ajouté avec succès", [{ text: "OK", onPress: () => navigation.goBack() }]);
  } catch (error) {
    console.error("Erreur lors de l'ajout du client:", error);
    Alert.alert("Erreur", "Une erreur s'est produite lors de l'ajout du client");
  } finally {
    setLoading(false);
  }
};

  const toggleButtonMode = () => {
    setIsAddMode(!isAddMode);
    setModalVisible(!modalVisible);
  };
 

  return (
    <View style={styles.container}>
      
      <Header title="Informations Personnelles" showBackButton={true} />
      <View style={styles.profileContainer}>
       <Image
  source={{ uri: "https://avatar.iran.liara.run/public/77" }} 
  style={styles.profileImage}
/>

        <Text style={styles.profileName}>Mayar Mehrzi</Text>
      </View>

      <ScrollView contentContainerStyle={styles.menuContainer}>
        <View style={styles.formGroup}>
                   <Text style={styles.label}>Prénom</Text>
                   <TextInput
                     style={styles.input}
                     placeholder="Mayar"
                     placeholderTextColor="#A7A9B7"
                     value={clientName}
                     onChangeText={setClientName}
                   />
                 </View>

                 <View style={styles.formGroup}>
                   <Text style={styles.label}>Nom</Text>
                   <TextInput
                     style={styles.input}
                     placeholder="Mehrzi"
                     placeholderTextColor="#A7A9B7"
                     value={clientLastName}
                     onChangeText={setClientLastName}
                   />
                 </View>
                 <View style={styles.formGroup}>
                   <Text style={styles.label}>Email</Text>
                   <TextInput
                     style={styles.input}
                     placeholder="mayarmehrzi22@gmail.com"
                     placeholderTextColor="#A7A9B7"
                     value={clientEmail}
                     onChangeText={setClientEmail}
                   />
                 </View>
                 <View style={styles.formGroup}>
                   <Text style={styles.label}>Téléphone</Text>
                   <TextInput
                     style={styles.input}
                     placeholder="+215 46595556"
                     placeholderTextColor="#A7A9B7"
                     value={clientTel}
                     onChangeText={setClientTel}
                   />
                 </View>
                 <View style={styles.formGroup}>
                   <Text style={styles.label}>Mot de passe</Text>
                   <TextInput
                     style={styles.input}
                     placeholder=""
                     placeholderTextColor="#A7A9B7"
                     value={clientMdp}
                     onChangeText={setClientMdp}
                   />
                 </View>

                           <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
                             {loading ? <ActivityIndicator color="white" /> : <Text style={styles.submitButtonText}>Ajouter le client</Text>}
                           </TouchableOpacity>
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
    padding: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#27251F",
    marginBottom: 16,
  },
  profileContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#fff",
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  menuContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  menuText: {
    fontSize: 16,
    color: "#1B2128",
  },
  
});

export default InfoPerso;