import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Rect, Text } from "react-native-svg";

const Statusbadge2: React.FC<{ status: string }> = ({ status }) => {
  return (
    <View style={styles.badge}>
       <Svg width={129} height={29} viewBox="0 0 109 19" fill="none">
            <Rect y={0.813} width={108.836} height={17.923} rx={8.962} fill="#877DAB" />
            <Circle cx={8.514} cy={9.775} r={2.591} fill="white" />
            <Text fill="white" fontSize={8.995} fontFamily="Avenir" x={15.548} y={12.627}>
              {status } 
            </Text>
          </Svg>
      <Text style={styles.badgeText}>{status}</Text>
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
    fontWeight: "bold",
  },
});

export default Statusbadge2;