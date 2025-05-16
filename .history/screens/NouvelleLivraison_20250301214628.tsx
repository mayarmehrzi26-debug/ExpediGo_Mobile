import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const NouvelleLivraison = () => {
  return (
    <View style={styles.container}>
      <Text>Nouvelle Livraison Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NouvelleLivraison;
