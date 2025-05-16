import React from "react";
import Svg, { Circle, Rect, Text } from "react-native-svg";

interface StatusBadgeProps {
  status?: string; // Le statut est passé via les props
  backgroundColor?: string; // Couleur de fond dynamique
  textColor?: string; // Couleur du texte dynamique
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status = "Statut",
  backgroundColor = "#877DAB",
  textColor = "white",
}) => {
  const baseWidth = 40;
  const extraWidthPerChar = 6;
  const badgeWidth = baseWidth + status.length * extraWidthPerChar;

  return (
    <Svg width={badgeWidth} height={29} viewBox={`0 0 ${badgeWidth} 19`} fill="none">
      <Rect
        y={0.813}
        width={badgeWidth}
        height={17.923}
        rx={8.962}
        fill={backgroundColor} // Couleur de fond dynamique
      />
      <Circle cx={8.514} cy={9.775} r={2.591} fill="white" />
      <Text
        fill={textColor} // Couleur du texte dynamique
        fontSize={8.995}
        fontFamily="Avenir"
        x={15.548}
        y={12.627}
      >
        {status}
      </Text>
    </Svg>
  );
};

export default StatusBadge;
