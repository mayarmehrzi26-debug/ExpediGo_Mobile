import React, { useEffect, useState } from "react";
import { Alert } from "react-native";
import { AjoutAdressModel } from "./AjoutAdressModel";
import { AjoutAdressView } from "./AjoutAdressView";

interface AjoutAdressPresenterProps {
  navigation: any;
}

export const AdressPresenter: React.FC<AjoutAdressPresenterProps> = ({ navigation }) => {
  const [zone, setZone] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    initializeLocation();
  }, []);

  const initializeLocation = async () => {
    const hasPermission = await AjoutAdressModel.requestLocationPermission();
    if (!hasPermission) {
      Alert.alert("Permission refusée", "L'application a besoin d'accéder à votre localisation.");
      return;
    }

    const loc = await AjoutAdressModel.getCurrentLocation();
    setLocation(loc);

    const city = await AjoutAdressModel.getCityFromCoords(loc.latitude, loc.longitude);
    setZone(city);
  };

  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setLocation({ latitude, longitude });

    const zoneName = await AjoutAdressModel.getCityFromCoords(latitude, longitude);
    setZone(zoneName);
    setModalVisible(false);
  };

  const handleSubmit = async () => {
    if (!zone || !address || !location) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs et choisir une zone sur la carte.");
      return;
    }

    try {
      setLoading(true);
      await AjoutAdressModel.saveAddress(zone, address, location);
      Alert.alert("Succès", "Adresse ajoutée avec succès", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'adresse:", error);
      Alert.alert("Erreur", "Une erreur s'est produite lors de l'ajout de l'adresse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AjoutAdressView
      zone={zone}
      address={address}
      location={location}
      loading={loading}
      modalVisible={modalVisible}
      onZoneChange={setZone}
      onAddressChange={setAddress}
      onMapPress={handleMapPress}
      onSubmit={handleSubmit}
      onModalToggle={setModalVisible}
      onBackPress={() => navigation.goBack()}
    />
  );
};