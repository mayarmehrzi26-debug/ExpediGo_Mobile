import React from "react";
import Svg, { Circle, Rect, Text } from "react-native-svg";

interface StatusBadgeProps {
  status?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status = "Statut" }) => {
  // Determine colors based on status
  const getStatusColors = () => {
    switch (status) {
      case "En attente d'enlévement":
        return { backgroundColor: "#F06292", color: "#22C55E" };
      case "En cours de livraison":
        return { backgroundColor: "#DBEAFE", color: "#3B82F6" };
      case "Livré":
        return { backgroundColor: "#FEF9C3", color: "#F59E0B" };
      default:
        return { backgroundColor: "#F3F4F6", color: "#6B7280" };
    }
  };

  const colors = getStatusColors();
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
        fill={colors.bg}
      />
      <Circle cx={8.514} cy={9.775} r={2.591} fill={colors.text} />
      <Text
        fill={colors.text}
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