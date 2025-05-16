import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const filterOptions = [
  "Toutes les pickups",
  "En attente d'enlèvement",
  "Annulé par admin",
];

const FilterOption = ({ label, isActive, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text style={[
        styles.filterOptionText,
        isActive ? styles.activeFilterOption : null
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const ResultCount = ({ count }) => {
  return (
    <Text style={styles.resultCount}>
      Nombre total trouvé: {count}
    </Text>
  );
};

const FilterBar = () => {
  const [activeFilter, setActiveFilter] = useState(filterOptions[0]);
  const totalResults = 39;

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        {filterOptions.map((option) => (
          <FilterOption
            key={option}
            label={option}
            isActive={activeFilter === option}
            onPress={() => setActiveFilter(option)}
          />
        ))}
      </View>
      <ResultCount count={totalResults} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxWidth: 364,
    alignContent:'center'
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 36,
    padd
  },
  filterOptionText: {
    fontSize: 11,
    color: '#27251F',
    fontWeight: '500',
  },
  activeFilterOption: {
    color: '#FD5A1E',
  },
  resultCount: {
    color: '#A7A9B7',
    fontSize: 9,
    marginTop: 6,
  },
});

export default FilterBar;
