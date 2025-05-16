import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
      {count} résultat{count !== 1 ? "s" : ""} trouvé{count !== 1 ? "s" : ""}
    </Text>
  );
};

const FilterBar = ({ deliveries, filterOptions, onFilterChange }) => {
  const [activeFilter, setActiveFilter] = useState(filterOptions[0]);

  const handleFilterChange = (option) => {
    setActiveFilter(option);
    onFilterChange(option); // Appeler la fonction de filtrage
  };

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
      <ResultCount count={deliveries.length} />
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
    gap: 11,
  },
  filterOptionText: {
    fontSize: 11,
    color: '#27251F',
    fontWeight: '500',
  },
  activeFilterOption: {
    color: '#877DAB',
  },
  resultCount: {
    color: '#A7A9B7',
    fontSize: 9,
    marginTop: 6,
  },
});

export default FilterBar;