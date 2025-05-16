import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const FilterBar = ({ selectedFilter, onFilterChange, filterOptions }) => {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.filterButton,
              selectedFilter === option && styles.selectedFilterButton,
            ]}
            onPress={() => onFilterChange(option)}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === option && styles.selectedFilterText,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    backgroundColor: '#F0F0F0',
    marginRight: 10,
  },
  selectedFilterButton: {
    backgroundColor: '#877DAB',
  },
  filterText: {
    color: '#A7A9B7',
    fontSize: 12,
  },
  selectedFilterText: {
    color: '#FFF',
  },
});

export default FilterBar;