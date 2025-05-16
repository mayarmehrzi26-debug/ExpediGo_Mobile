import React from "react";
import Svg, { Circle, Rect, Text } from "react-native-svg";

interface StatusBadgeProps {
  status?: string; // Le statut est passé via les props
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status = "Statut" }) => {
  // Calculer la largeur du badge en fonction de la longueur du texte
  const baseWidth = 40; // Largeur de base
  const extraWidthPerChar = 6; // Largeur supplémentaire par caractère
  const textLength = status.length; // Nombre de caractères dans le texte
  const badgeWidth = baseWidth + textLength * extraWidthPerChar; // Largeur totale du badge

  return (
    <Svg width={badgeWidth} height={29} viewBox={`0 0 ${badgeWidth} 19`} fill="none">
      <Rect
        y={0.813}
        width={badgeWidth}
        height={17.923}
        rx={8.962}
        fill="#877DAB" // Couleur de fond
      />
      <Circle cx={8.514} cy={9.775} r={2.591} fill="white" />
      <Text
        fill="white"
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
