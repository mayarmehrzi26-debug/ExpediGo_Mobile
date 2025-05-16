import { Ionicons } from "@expo/vector-icons";
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

const FileExplorer = ({ searchQuery, setSearchQuery }) => {
  return (
    <View style={styles.container}>
      {/* Search input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={15} color="#FF6B6B" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher par client ou ID"
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
