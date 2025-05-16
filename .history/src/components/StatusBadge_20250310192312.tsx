import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import Svg, { Circle, Rect, Text } from "react-native-svg";
import { firebasestore } from "../../FirebaseConfig"; // Assurez-vous que le chemin d'importation est correct

const StatusBadge: React.FC<> = ({ deliveryId }) => {
  const [statusText, setStatusText] = useState("Chargement...");

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        // Récupérer le document de la livraison en utilisant deliveryId
        const deliveryDoc = await getDoc(doc(firebasestore, "livraisons", deliveryId));
        if (deliveryDoc.exists()) {
          const deliveryData = deliveryDoc.data();
          console.log("Données de la livraison :", deliveryData); // Debug: afficher les données récupérées
          
          // Vérifiez si le champ nomStat existe et est une chaîne
          if (deliveryData && typeof deliveryData.status === 'string') {
            setStatusText(deliveryData.status); // Utiliser le champ approprié pour le statut
          } else {
            setStatusText("Statut introuvable");
          }
        } else {
          setStatusText("Erreur : Livraison introuvable");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du statut : ", error);
        setStatusText("Erreur de chargement");
      }
    };

    fetchStatus();
  }, [deliveryId]); // Ajoutez deliveryId comme dépendance

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