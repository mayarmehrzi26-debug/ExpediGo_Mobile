import React from "react";
import {, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const CustomDropdown = ({ placeholder, options, onSelect, selectedValue }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>{placeholder}</Text>
      <TouchableOpacity style={styles.dropdown} onPress={onSelect}>
        <Text>{selectedValue || "Select an option"}</Text>
      </TouchableOpacity>
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
});

export default CustomDropdown;