// CustomDropdown.tsx
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  ListRenderItem,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { DropdownOption } from '../types';

interface CustomDropdownProps {
  options?: DropdownOption[];
  placeholder: string;
  onSelect: (value: string) => void;
  selectedValue?: string | null;
  testID?: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options = [],
  placeholder,
  onSelect,
  selectedValue,
  testID,
}) => {
  const [visible, setVisible] = useState(false);

  // Fonction pour obtenir le texte à afficher
  const getDisplayText = () => {
    if (!selectedValue) return placeholder;
    
    const selectedOption = options.find(opt => opt.value === selectedValue);
    if (!selectedOption) return placeholder;
    
    // Si c'est un JSX.Element, on retourne le placeholder
    if (typeof selectedOption.label !== 'string') {
      return placeholder;
    }
    
    return selectedOption.label;
  };

  // Fonction de rendu pour chaque élément de la liste
  const renderItem: ListRenderItem<DropdownOption> = ({ item }) => (
    <TouchableOpacity
      style={styles.option}
      onPress={() => {
        onSelect(item.value);
        setVisible(false);
      }}
      testID={`dropdown-option-${item.value}`}
    >
      {typeof item.label === 'string' ? (
        <Text style={styles.optionText}>{item.label}</Text>
      ) : (
        item.label
      )}
      {item.image && (
        <Image
          source={{ uri: item.image }}
          style={styles.optionImage}
          resizeMode="contain"
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.dropdownContainer} testID={testID}>
      <TouchableOpacity 
        style={styles.dropdownButton} 
        onPress={() => setVisible(true)} 
        activeOpacity={0.8}
        testID="dropdown-toggle"
      >
        <Text 
          style={styles.dropdownButtonText}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {getDisplayText()}
        </Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setVisible(false)}
          testID="dropdown-overlay"
        >
          <View style={styles.modalContent}>
            <FlatList
              data={options}
              keyExtractor={(item) => `dropdown-item-${item.value}`}
              renderItem={renderItem}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={10}
              testID="dropdown-list"
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownContainer: {
    width: '100%',
    marginVertical: 8,
  },
  dropdownButton: {
    height: 42,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#A7A9B7',
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.8 },
    shadowOpacity: 0.16,
    shadowRadius: 3,
    elevation: 2,
  },
  dropdownButtonText: {
    color: '#000',
    fontSize: 11,
    fontFamily: 'Avenir',
    flex: 1,
    marginRight: 8,
  },
  dropdownArrow: {
    color: '#574599',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '70%',
    backgroundColor: 'white',
    borderRadius: 5,
    overflow: 'hidden',
  },
  option: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionText: {
    fontSize: 11,
    color: '#27251F',
    fontFamily: 'Avenir',
    flex: 1,
  },
  optionImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginLeft: 8,
  },
});

export default CustomDropown;