import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import { Camera } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import { Animated, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../NavigationTypes';
import CashBox from '../src/components/CashBox';
import StatsList from '../src/components/StatsList';
import BarcodeScanner from './BarcodeScanner';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'HomeScreen'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isAddMode, setIsAddMode] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [isCashBoxOpen, setIsCashBoxOpen] = useState(false);
  const cashBoxHeight = useState(new Animated.Value(0))[0];

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const toggleCashBox = () => {
    setIsCashBoxOpen(!isCashBoxOpen);
    Animated.timing(cashBoxHeight, {
      toValue: isCashBoxOpen ? 0 : 200, // Ajuste la hauteur selon besoin
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={styles.container}>
      {cameraVisible ? (
        <BarcodeScanner onClose={() => setCameraVisible(false)} />
      ) : (
        <>
          <View style={styles.headerContainer}>
            <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
            <TouchableOpacity onPress={() => setCameraVisible(true)}>
              <MaterialIcons name="qr-code-scanner" size={24} color="black" style={{ marginLeft: 190 }} />
            </TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color="black" />
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Animated.View style={{ height: cashBoxHeight, overflow: 'hidden' }}>
              <CashBox availableCash="0,000 dt" unavailableCash="115,000 dt" totalCash="115,000 dt" />
            </Animated.View>
            <TouchableOpacity onPress={toggleCashBox}>
              <View style={styles.bottomBar} />
            </TouchableOpacity>
            <StatsList />
          </ScrollView>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    paddingTop: 30,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  logo: {
    width: 120,
    height: 60,
  },
  bottomBar: {
    width: 60,
    height: 5,
    backgroundColor: '#A7A9B7',
    borderRadius: 10,
    alignSelf: 'center',
    marginVertical: 10,
  },
});

export default HomeScreen;
