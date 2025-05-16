import React from "react";
import { Switch, Text, View } from "react-native";

interface Props {
  label: string;
  value: boolean;
  onToggle: (val: boolean) => void;
}

const CustomToggle: React.FC<Props> = ({ label, value, onToggle }) => {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 5 }}>
      <Text>{label}</Text>
      <Switch value={value} onValueChange={onToggle} />
    </View>
  );
};

export default CustomToggle;
