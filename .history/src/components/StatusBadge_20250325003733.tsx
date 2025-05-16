import React from "react";
import Svg, { Circle, Rect, Text } from "react-native-svg";

interface StatusBadgeProps {
  status?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status = "Statut" }) => {
  // Determine colors based on status
  const getStatusColors = () => {
    switch (status) {
      case "En attente d'enlèvement":
        return { bg: "#F06292", text: "#FEE2E2" }; // Yellow
      case "Non traité":
        return { bg: "#DBEAFE", text: "#3B82F6" }; // Blue
      case "Annulée":
        return { bg: "#EF4444", text: "#FEE2E2" }; // Red
      case "En cours de livraison":
        return { bg: "#10B981", text: "#ECFDF5" }; // Green
      case "Livré":
        return { bg: "#877DAB", text: "white" }; // Teal
      default:
        return { bg: "#877DAB", text: "white" }; // Default purple
    }
  };

  const colors = getStatusColors();
  const baseWidth = 20;
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
        fontSize={11}
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