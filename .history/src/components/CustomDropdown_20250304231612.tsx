import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const CustomDropdown = ({ placeholder, options, onSelect, selectedValue }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>{placeholder}</Text>
      <TouchableOpacity style={styles.dropdown} onPress={onSelect}>
        <Text>{selectedValue ? selectedValue.label : "Select an option"}</Text>
      </TouchableOpacity>
      {selectedValue && (
        <View style={styles.optionsContainer}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={styles.option}
              onPress={() => onSelect(option)}
            >
              <Text>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  placeholder: {
    fontSize: 16,
    marginBottom: 5,
  },
  dropdown: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  optionsContainer: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  option: {
    padding: 10,
  },
});

export default CustomDropdown;