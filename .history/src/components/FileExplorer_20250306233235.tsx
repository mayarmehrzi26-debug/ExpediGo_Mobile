import { Ionicons } from "@expo/vector-icons";
import React from 'react';
import { Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

const FileExplorer = () => {
  return (
    <View style={styles.container}>
      {/* Checkbox */}
      <TouchableOpacity style={styles.checkbox}>
        <View style={styles.checkboxInner} />
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
    padding: 8,
    borderRadius: 4,
  },
  checkbox: {
    width: 16,
    height: 16,
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
  fileIcon: {
    marginRight: 12,
  },
  icon: {
    width: 20,
    height: 24,
    resizeMode: 'contain',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: ,
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
