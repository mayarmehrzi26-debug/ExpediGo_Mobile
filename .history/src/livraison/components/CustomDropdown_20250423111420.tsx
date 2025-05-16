import React, { useState } from "react";
import { Modal, FlatList, TouchableOpacity, Text, View, Image } from "react-native";
import { DropdownOption } from "../model/livraison.model";
import { styles } from "./CustomDropdown.styles";

interface CustomDropdownProps {
  options?: DropdownOption[];
  placeholder: string;
  onSelect: (value: string) => void;
  selectedValue?: string;
  onAddNew?: () => void;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({ 
  options = [], 
  placeholder, 
  onSelect, 
  selectedValue,
  onAddNew
}) => {
  const [visible, setVisible] = useState(false);
  const selectedLabel = options.find((option) => option.value === selectedValue)?.label || placeholder;

  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity style={styles.dropdownButton} onPress={() => setVisible(true)} activeOpacity={0.8}>
        <Text style={styles.dropdownButtonText}>
          {typeof selectedLabel === "string" ? selectedLabel : placeholder}
        </Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setVisible(false)}>
          <View style={styles.modalContent}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => {
                    if (item.value === "new_item" && onAddNew) {
                      onAddNew();
                    } else {
                      onSelect(item.value);
                    }
                    setVisible(false);
                  }}
                >
                  {typeof item.label === "string" ? (
                    <Text style={styles.optionText}>{item.label}</Text>
                  ) : (
                    item.label
                  )}
                  {item.image && (
                    <Image
                      source={{ uri: item.image }}
                      style={{ width: 30, height: 30, borderRadius: 5, marginLeft: 8 }}
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