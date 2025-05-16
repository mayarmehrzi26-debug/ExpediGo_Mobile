import { Ionicons } from "@expo/vector-icons";
import React, { useState } from 'react';
import { Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

const FileExplorer = ({ searchQuery, setSearchQuery, toggleSelectAll }) => {
  const [isChecked, setIsChecked] = useState(false); // État pour la case à cocher

  const handleCheckboxToggle = () => {
    setIsChecked(prev => !prev);
    toggleSelectAll(); // Appeler la fonction pour sélectionner/désélectionner tout
  };

  return (
    <View style={styles.container}>
      {/* Checkbox pour sélectionner/désélectionner tout */}
      <TouchableOpacity onPress={handleCheckboxToggle} style={styles.checkbox}>
        <View style={[styles.checkboxInner, isChecked && styles.checkboxChecked]} />
      </TouchableOpacity>

      {/* File icons */}
      <TouchableOpacity style={styles.fileIcon}>
        <Image 
          source={require('../../assets/file-icon-green.png')} 
          style={styles.icon}
        />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.fileIcon}>
        <Image 
          source={require('../../assets/file-icon-grey.png')} 
          style={styles.icon}
        />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.fileIcon}>
        <Image 
          source={require('../../assets/file-icon-empty.png')} 
          style={styles.icon}
        />
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
    padding: 10,
    paddingLeft: 30,
    paddingRight: 27,
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
  checkboxChecked: {
    backgroundColor: '#54E598', // Couleur lorsque sélectionné
    borderColor: '#54E598',
  },
  fileIcon: {
    marginRight: 14,
  },
  icon: {
    width: 30,
    height: 34,
    resizeMode: 'contain',
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

export default FileExplorer;