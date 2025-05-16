import React from 'react';
import { View, Image, TouchableOpacity,StyleSheet } from 'react-native';
import { Ionicons,MaterialIcons } from '@expo/vector-icons';
import MoneyBagIcon from '../../components/Home/MoneyBagIcon ';
import { useNavigation } from '@react-navigation/native';
import { HomeScreenNavigationProp } from '../../../NavigationTypes';

const HomeHeader: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  return (
    <View style={styles.headerContainer}>
      <Image
        source={require('../../../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <TouchableOpacity onPress={() => navigation.navigate('BarcodeScanner')}>
        <MaterialIcons
          name="qr-code-scanner"
          size={24}
          color="black"
          style={{ marginLeft: 110 }}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Caisse')}>
        <MoneyBagIcon />
      </TouchableOpacity>
      <Ionicons name="notifications-outline" size={24} color="black" />
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    marginHorizontal: 12
  },
  logo: {
    width: 125,
    height: 60,
  },
});

export default HomeHeader;