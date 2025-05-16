import { useNavigation } from "@react-navigation/native";
import React, { useRef } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Swiper from "react-native-swiper";

const OnboardingScreen = () => {
  const swiperRef = useRef<Swiper>(null);
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1 }}>
      <Swiper
        ref={swiperRef}
        loop={false}
        dotStyle={styles.dot}
        activeDotStyle={styles.activeDot}
      >
        {/* Première page */}
        <View style={styles.container}>
          <Image source={require("../assets/1.png")} style={styles.image} />
          <Text style={styles.title}>Passer des Commandes de Livraison</Text>
          <Text style={styles.subtitle}>
            C'est facile et rapide à utiliser pour choisir le type de livraison et planifier l'envoi.
          </Text>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("SignUp")}>
          <Text style={styles.buttonText}>Créer un compte</Text>
          </TouchableOpacity>
          <View style={styles.arrowContainer}>
          <TouchableOpacity onPress={() => swiperRef.current?.scrollBy(-1)}>
              <Text style={styles.arrow}></Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => swiperRef.current?.scrollBy(1)}>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Deuxième page */}
        <View style={styles.container}>
          <Image source={require("../assets/2.png")} style={styles.image} />
          <Text style={styles.title}>Historique des Livraisons</Text>
          <Text style={styles.subtitle}>
            Consultez l'historique de vos livraisons dans le tableau de bord pour un suivi facile.
          </Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Créer un compte</Text>
          </TouchableOpacity>
          <View style={styles.arrowContainer}>
            <TouchableOpacity onPress={() => swiperRef.current?.scrollBy(-1)}>
              <Text style={styles.arrow}>←</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => swiperRef.current?.scrollBy(1)}>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Troisième page */}
        <View style={styles.container}>
          <Image source={require("../assets/3.png")} style={styles.image} />
          <Text style={styles.title}>Support et Gestion des Tickets</Text>
          <Text style={styles.subtitle}>
            Vous pouvez soumettre vos demandes et obtenir des informations de la manière la plus simple.
          </Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Créer un compte</Text>
          </TouchableOpacity>
          <View style={styles.arrowContainer}>
            <TouchableOpacity onPress={() => swiperRef.current?.scrollBy(-1)}>
              <Text style={styles.arrow}>←</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Swiper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#3D0666",
  },
  image: {
  marginTop:80,
    width: 400,
    height: 400,
    resizeMode: "contain",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#fff",

  },
  subtitle: {
    fontSize: 11,
    textAlign: "center",
    color: "#fff",
    marginTop: 15,
    marginLeft: 30,
    marginRight: 30,
    lineHeight: 22,
  },
  button: {
    marginTop: 50,
    backgroundColor: "#D94DB5",
    paddingVertical: 12,
    paddingHorizontal: 72,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  dot: {
    backgroundColor: "#ccc",
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: "#D94DB5",
    width: 10,
    height: 10,
  },
  arrowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 80,
  },
  arrow: {
    fontSize: 37,
    color: "#D94DB5"

  },
  
});

export default OnboardingScreen;