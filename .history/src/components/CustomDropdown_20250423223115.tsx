import React, { useState } from 'react';
import { FlatList, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DropdownOption {
  label: string | JSX.Element;
  value: string;
  image?: string;
}

interface CustomDropdownProps {
  options?: DropdownOption[];
  placeholder: string;
  onSelect: (value: string) => void;
  selectedValue?: string | null;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ 
  options = [], 
  placeholder, 
  onSelect, 
  selectedValue 
}) => {
  const [visible, setVisible] = useState(false);
  
  const handleSelect = (value: string) => {
    onSelect(value); // Appelle la fonction parente
    setVisible(false); // Ferme le modal
  };

  const selectedOption = options.find(option => option.value === selectedValue);
  const displayText = selectedOption ? 
    (typeof selectedOption.label === 'string' ? selectedOption.label : placeholder) 
    : placeholder;

  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity 
        style={styles.dropdownButton} 
        onPress={() => setVisible(true)} 
        activeOpacity={0.8}
      >
        <Text style={styles.dropdownButtonText} numberOfLines={1}>
          {displayText}
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
        >
          <View style={styles.modalContent}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => handleSelect(item.value)}
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
                    />
                  )}
                </TouchableOpacity>
              )}
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

export default CustomDropdown;