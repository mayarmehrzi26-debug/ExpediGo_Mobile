import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import Svg, { Circle, Rect, Text } from "react-native-svg";
import { firebasestore } from "../../FirebaseConfig"; // Assurez-vous que le chemin d'importation est correct

const StatusBadge: React.FC = () => {
  const [statusText, setStatusText] = useState("Chargement...");

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const statusDoc = await getDoc(doc(firebasestore, "livraisons")); // Récupérer le document avec l'ID 0
        if (statusDoc.exists()) {
          const statusData = statusDoc.data();
          setStatusText(statusData.status); // Remplacer par le champ approprié
        } else {
          setStatusText("Statut introuvable");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du statut : ", error);
        setStatusText("Erreur de chargement");
      }
    };

    fetchStatus();
  }, []);

  return (
    <Svg width={129} height={29} viewBox="0 0 109 19" fill="none">
      <Rect y={0.813} width={108.836} height={17.923} rx={8.962} fill="#FF4E51" />
      <Circle cx={8.514} cy={9.775} r={2.591} fill="white" />
      <Text fill="white" fontSize={8.995} fontFamily="Avenir" x={15.548} y={12.627}>
        {statusText}
      </Text>
    </Svg>
  );
};

export default StatusBadge;