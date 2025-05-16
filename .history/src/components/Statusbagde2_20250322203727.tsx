import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

const Statusbadge2: React.FC<{ status: string }> = ({ status }) => {
  return (
    <View style={styles.badge}>
       <Svg width={109} height={19}  fill="none">
            <Circle cx={7.514} cy={8.775} r={2.591} fill="white" />
                 <Text style={styles.badgeText}>{status}</Text>

          </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: "#877DAB", // Couleur par défaut
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 20,
  },
  badgeText: {
    color: "#fff",
    paddingLeft:14
  },
});

export default Statusbadge2;