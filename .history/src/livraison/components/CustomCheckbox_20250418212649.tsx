import React from "react";
import { Switch, Text, View } from "react-native";

interface Props {
  label: string;
  value: boolean;
  onChange: (val: boolean) => void;
}

const CustomCheckbox: React.FC<Props> = ({ label, value, onChange }) => {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 5 }}>
      <Text>{label}</Text>
      <Switch value={value} onValueChange={onChange} />
    </View>
  );
};

export default CustomCheckbox;
