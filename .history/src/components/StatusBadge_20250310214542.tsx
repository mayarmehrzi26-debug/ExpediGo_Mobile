import { collection, getDocs, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import Svg, { Circle, Rect, Text } from "react-native-svg";
import { firebasestore } from "../../FirebaseConfig";

const StatusBadge: React.FC = () => {
  const [status, setStatus] = useState<string | null>(null); // Changez le type pour string ou null

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const q = query(collection(firebasestore, "livraisons"));
        const querySnapshot = await getDocs(q);

        // Récupérer le premier statut trouvé pour simplifier
        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[1].data(); // Récupérer le premier document

          const statusSnapshot = await getDocs(collection(firebasestore, "Status"));
          const statusData = statusSnapshot.docs.find(statusDoc => statusDoc.id === data.status)?.data();

          setStatus(statusData?.nomStat || "Statut inconnu"); // Définir le statut ou un message par défaut
        } else {
          setStatus("Pas de livraisons disponibles");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des statuts :", error);
      }
    };

    fetchStatus();
  }, []);

  return (
    <Svg width={129} height={29} viewBox="0 0 109 19" fill="none">
      <Rect y={0.813} width={108.836} height={17.923} rx={8.962} fill="#FF4E51" />
      <Circle cx={8.514} cy={9.775} r={2.591} fill="white" />
      <Text fill="white" fontSize={8.995} fontFamily="Avenir" x={15.548} y={12.627}>
        {status} {/* Affichage du statut */}
      </Text>
    </Svg>
  );
};

export default StatusBadge;