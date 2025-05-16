import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface FloatingButtonProps {
  onPress: () => void;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.floatingButton} onPress={onPress}>
      <Ionicons name={"add"} size={54} color="white" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    width: 66,
    height: 66,
    borderRadius: 38,
    backgroundColor: "#877DAB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    marginLeft: 260,
  },
});

export default FloatingButton;
