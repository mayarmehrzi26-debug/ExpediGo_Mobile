// src/components/FilterBar.tsx
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

interface FilterBarProps {
  deliveries: any[];
  onFilterChange: (filter: string) => void; // Nouvelle prop pour gérer le changement de filtre
}

const FilterBar: React.FC<FilterBarProps> = ({ deliveries, onFilterChange }) => {
  const [activeFilter, setActiveFilter] = useState(filterOptions[0]);

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter); // Mettre à jour le filtre actif
    onFilterChange(filter); // Notifier la page Livraison du changement de filtre
  };

  const totalResults = deliveries.length;

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        {filterOptions.map((option) => (
          <FilterOption
            key={option}
            label={option}
            isActive={activeFilter === option}
            onPress={() => handleFilterChange(option)}
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
    alignContent: 'center',
    paddingLeft: 22,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 36,
  },
  filterOptionText: {
    fontSize: 1,
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