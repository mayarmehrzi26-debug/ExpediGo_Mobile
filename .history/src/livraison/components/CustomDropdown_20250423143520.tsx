import React, { useState } from "react";
import {
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface DropdownOption {
  label: string | JSX.Element;
  value: string;
  image?: string;
  price?: number;
}

interface CustomDropdownProps {
  options?: DropdownOption[];
  placeholder: string;
  onSelect: (value: string) => void;
  selectedValue?: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options = [],
  placeholder,
  onSelect,
  selectedValue,
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
                    onSelect(item.value);
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

const styles = StyleSheet.create({
  // ... (same styles as original)
});

export default CustomDropdown;