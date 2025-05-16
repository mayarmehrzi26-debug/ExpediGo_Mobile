import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import Header from "../src/components/Header"; // Assurez-vous que le chemin est correct
import NavBottom from "../src/components/NavBottom"; // Assurez-vous que le chemin est correct

const Support: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState("HomeScreen");

  return (
    <View style={styles.container}>
<Header title="Tickets" showBackButton={true} />

      {/* Contenu de la page */}
      <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.container}>
      <Image
        source={{
          uri: 'https://cdn.builder.io/api/v1/image/assets/f3828464c96d4349b61f8cc61d540aaa/7692feb91b101742e4efe16969e547f1986ac35d26fe3fb70d10ad93602900f9?placeholderIfAbsent=true',
        }}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
      </ScrollView>

      {/* Barre de navigation en bas */}
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#27251F",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: "#A7A9B7",
    textAlign: "center",
  },
  image: {
    aspectRatio: 1,
    width: '100%',
    borderRadius: 62,
  },
});

export default Support;