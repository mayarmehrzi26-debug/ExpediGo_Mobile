import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CustomCheckboxProps {
  checked: boolean;
  onToggle: () => void;
  label?: string;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ checked, onToggle, label }) => {
  return (
    <TouchableOpacity style={styles.checkboxContainer} onPress={onToggle} activeOpacity={0.8}>
      <View style={[styles.checkbox, checked && styles.checkedBox]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      {label && <Text style={styles.checkboxLabel}>{label}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // ... (same styles as original)
});

export default CustomCheckbox;