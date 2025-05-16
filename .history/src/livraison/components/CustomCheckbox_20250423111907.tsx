import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "../CustomCheckbox.styles";

interface CustomCheckboxProps {
  checked: boolean;
  onToggle: () => void;
  label?: string;
}

export const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ 
  checked, 
  onToggle, 
  label 
}) => {
  return (
    <TouchableOpacity 
      style={styles.checkboxContainer} 
      onPress={onToggle} 
      activeOpacity={0.8}
    >
      <View style={[styles.checkbox, checked && styles.checkedBox]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      {label && <Text style={styles.checkboxLabel}>{label}</Text>}
    </TouchableOpacity>
  );
};