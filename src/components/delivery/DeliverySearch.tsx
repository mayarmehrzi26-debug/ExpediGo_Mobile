import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

interface DeliverySearchProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
}

const DeliverySearch: React.FC<DeliverySearchProps> = ({
  searchQuery,
  onSearchChange,
}) => {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color="#A7A9B7" style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder="Rechercher une commande..."
        placeholderTextColor="#A7A9B7"
        value={searchQuery}
        onChangeText={onSearchChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#27251F',
  },
});

export default DeliverySearch;