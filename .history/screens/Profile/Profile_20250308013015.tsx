import { useNavigation } from "@react-navigation/native"; // Importer useNavigation depuis @react-navigation/native
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import Header from "../../src/components/Header";
import NavBottom from "../../src/components/NavBottom";
const ProfileAvatar = ({ name, src }: { name: string; src?: string }) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="h-20 w-20 border-2 border-gray-200 rounded-full overflow-hidden flex items-center justify-center bg-muted">
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span className="text-lg font-medium">{initials}</span>
      )}
    </div>
  );
};

// ProfileMenuItem component embedded directly in the file
const ProfileMenuItem = ({ label, onClick }: { label: string; onClick?: () => void }) => {
  return (
    <div 
      className="flex items-center justify-between py-4 border-b border-gray-100 cursor-pointer"
      onClick={onClick}
    >
      <span className="text-gray-700 text-base">{label}</span>
      <ChevronRight className="h-5 w-5 text-gray-400" />
    </div>
  );
};
const Profile: React.FC = () => {
  const navigation = useNavigation(); // Obtenir l'objet de navigation

  const [activeScreen, setActiveScreen] = useState("Profile");
  const [modalVisible, setModalVisible] = useState(false);
  const [isAddMode, setIsAddMode] = useState(true);

  const toggleButtonMode = () => {
    setIsAddMode(!isAddMode);
    setModalVisible(!modalVisible);
  };

  return (
    <View style={styles.container}>
      <Header title="Mon Profile" showBackButton={true} />
      <ScrollView contentContainerStyle={styles.content}>
       
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
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Add slight transparency for better visibility
  },
  modalContainer: {
    width: "80%",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    marginTop:393, 


  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#27251F",
    marginBottom: 16,
  },
 
  floatingButton: {
    width: 66,
    height: 66,
    borderRadius: 38,
    backgroundColor: "#54E598",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30, 
    marginLeft: 350, // Pour que le bouton s'intègre dans la Bottom Nav
    
  },
});

export default Profile;