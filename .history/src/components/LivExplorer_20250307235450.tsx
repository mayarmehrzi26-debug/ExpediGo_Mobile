import { Ionicons } from "@expo/vector-icons";
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

const LivExplorer = ({ searchQuery, setSearchQuery }) => {
  return (
    <View style={styles.container}>
      {/* Checkbox */}
      <TouchableOpacity style={styles.checkbox}>
        <View style={styles.checkboxInner} />
      </TouchableOpacity>
      
    
      
      {/* Search input */}
      <View style={styles.searchContainer}>
      <Ionicons name="search" size={15} color="#FF6B6B" style={styles.searchIcon} />

        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher"
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding:10,
    paddingLeft:40,
    paddingRight:27,


    borderRadius: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 8,
    marginLeft:22,
  },
  searchIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
    tintColor: '#9CA3AF',
  },
  searchInput: {
    flex: 1,
    height: 36,
    fontSize: 14,
    color: '#1F2937',
  },
});

export default LivExplorer;
