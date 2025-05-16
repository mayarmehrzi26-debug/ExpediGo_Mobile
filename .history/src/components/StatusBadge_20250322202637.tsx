import React from "react";
import Svg, { Circle, Rect, Text } from "react-native-svg";

interface StatusBadgeProps {
  status?: string; // Le statut est passé via les props
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <Svg width={110} height={29} viewBox="0 0 119 19" fill="none">
      <Rect y={0.813} width={108.836} height={17.923} rx={8.962} fill="#877DAB" />
      <Circle cx={8.514} cy={9.775} r={2.591} fill="white" />
      <Text fill="white" fontSize={8.995} fontFamily="Avenir" x={15.548} y={12.627}>
        {status } 
      </Text>
    </Svg>
  );
};

export default StatusBadge;