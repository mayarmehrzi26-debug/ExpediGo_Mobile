import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DeliveryFilterOption } from '../../deliveryTypes';

interface DeliveryFilterProps {
  selectedFilter: DeliveryFilterOption;
  onFilterChange: (filter: DeliveryFilterOption) => void;
}

const DeliveryFilter: React.FC<DeliveryFilterProps> = ({
  selectedFilter,
  onFilterChange,
}) => {
  const filters: DeliveryFilterOption[] = ['Toutes', 'Livrés', 'Retours', 'Échanges'];

  return (
    <View style={styles.container}>
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter}
          style={[
            styles.filterButton,
            selectedFilter === filter && styles.activeFilter,
          ]}
          onPress={() => onFilterChange(filter)}
        >
          <Text
            style={[
              styles.filterText,
              selectedFilter === filter && styles.activeFilterText,
            ]}
          >
            {filter}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFF',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  activeFilter: {
    backgroundColor: '#574599',
  },
  filterText: {
    color: '#A7A9B7',
    fontSize: 12,
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#FFF',
  },
});

export default DeliveryFilter;