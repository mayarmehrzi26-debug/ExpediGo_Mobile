// CustomDropdown.tsx
import React, { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CustomDropdownProps {
  placeholder: string;
  options: Array<{ label: string | React.ReactNode; value: string }>;
  onSelect: (value: string) => void;
  selectedValue: string | null;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  placeholder,
  options,
  onSelect,
  selectedValue,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const selectedLabel = selectedValue
    ? options.find((opt) => opt.value === selectedValue)?.label
    : placeholder;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setIsVisible(true)}
      >
        <Text style={styles.dropdownButtonText}>
          {typeof selectedLabel === "string" ? selectedLabel : placeholder}
        </Text>
      </TouchableOpacity>

      <Modal visible={isVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.option}
                onPress={() => {
                  onSelect(option.value);
                  setIsVisible(false);
                }}
              >
                {typeof option.label === "string" ? (
                  <Text style={styles.optionText}>{option.label}</Text>
                ) : (
                  option.label
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  dropdownButton: {
    height: 42,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#A7A9B7",
    backgroundColor: "#FFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    justifyContent: "space-between",
  },
  dropdownButtonText: {
    color: "#000",
    fontSize: 11,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 5,
    maxHeight: "70%",
  },
  option: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },
  optionText: {
    fontSize: 11,
    color: "#27251F",
  },
});

export default CustomDropdown;