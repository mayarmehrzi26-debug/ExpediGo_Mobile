import React, { useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DropdownOption {
  label: string | JSX.Element;
  value: string;
  image?: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  placeholder: string;
  onSelect: (value: string) => void;
  selectedValue: string | null;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ 
  options = [], 
  placeholder, 
  onSelect, 
  selectedValue 
}) => {
  const [visible, setVisible] = useState(false);

  const getSelectedLabel = () => {
    if (!selectedValue) return placeholder;
    
    const selectedOption = options.find(opt => opt.value === selectedValue);
    if (!selectedOption) return placeholder;
    
    return typeof selectedOption.label === 'string' 
      ? selectedOption.label 
      : placeholder;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.dropdownButtonText} numberOfLines={1}>
          {getSelectedLabel()}
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
                  style={[
                    styles.option,
                    selectedValue === item.value && styles.selectedOption
                  ]}
                  onPress={() => {
                    onSelect(item.value);
                    setVisible(false);
                  }}
                >
                  {typeof item.label === 'string' ? (
                    <Text style={styles.optionText}>{item.label}</Text>
                  ) : (
                    item.label
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
  container: {
    width: '100%',
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
  },
  dropdownButtonText: {
    flex: 1,
    color: '#000',
    fontSize: 11,
    fontFamily: 'Avenir',
  },
  dropdownArrow: {
    color: '#574599',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
  },
  selectedOption: {
    backgroundColor: '#f0f0f0',
  },
  optionText: {
    fontSize: 11,
    color: '#27251F',
    fontFamily: 'Avenir',
  },
});

export default CustomDropdown;