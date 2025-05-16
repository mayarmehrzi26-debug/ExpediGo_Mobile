import React, { useEffect } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CustomToggleProps {
  isEnabled: boolean;
  onToggle: () => void;
  label: string;
}

const CustomToggle: React.FC<CustomToggleProps> = ({ isEnabled, onToggle, label }) => {
  const position = new Animated.Value(isEnabled ? 1 : 0);

  useEffect(() => {
    Animated.spring(position, {
      toValue: isEnabled ? 1 : 0,
      useNativeDriver: false,
    }).start();
  }, [isEnabled]);

  return (
    <View style={styles.toggleContainer}>
      <TouchableOpacity activeOpacity={0.8} onPress={onToggle} style={styles.toggleButton}>
        <Animated.View
          style={[
            styles.toggle,
            {
              backgroundColor: position.interpolate({
                inputRange: [0, 1],
                outputRange: ["#D1D1D6", "#54E598"],
              }),
            },
          ]}
        >
          <Animated.View
            style={[
              styles.knob,
              {
                transform: [
                  {
                    translateX: position.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 15],
                    }),
                  },
                ],
              },
            ]}
          />
        </Animated.View>
      </TouchableOpacity>
      <Text style={styles.toggleLabel}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  // ... (same styles as original)
});

export default CustomToggle;