import React, { useEffect } from "react";
import { Animated, TouchableOpacity, Text, View } from "react-native";
import { CustomToggleProps } from "../types";

export const CustomToggle: React.FC<CustomToggleProps> = ({ isEnabled, onToggle, label }) => {
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

const styles = {
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  toggleButton: {
    width: 30,
    height: 15,
  },
  toggle: {
    width: 30,
    height: 15,
    borderRadius: 7.6,
    justifyContent: "center",
  },
  knob: {
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
    elevation: 2,
    marginLeft: 1,
  },
  toggleLabel: {
    color: "#27251F",
    fontSize: 13,
    fontFamily: "Avenir",
  },
};