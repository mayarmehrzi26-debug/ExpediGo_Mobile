import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';
import Svg, { Rect, Circle } from 'react-native-svg';
import { collection, getDocs } from "firebase/firestore";
import { firebasestore } from '../../FirebaseConfig'; // Assurez-vous que le chemin est correct

const StatusBadge = ({ orderId }) => {
  const [status, setStatus] = useState("Chargement..."); // État par défaut

  // Fonction pour récupérer le statut depuis Firestore
  const fetchStatus = async () => {
    try {
      const statusCollection = collection(firebasestore, "Status");
      const statusSnapshot = await getDocs(statusCollection);
      
      // Rechercher le statut correspondant à l'ID de commande
      const currentStatusDoc = statusSnapshot.docs.find(doc => doc.id === orderId); // Assurez-vous que l'ID est correct

      if (currentStatusDoc) {
        setStatus(currentStatusDoc.data().nomStat); // Remplacez "nomStat" par le champ correct
      } else {
        setStatus("Statut inconnu");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du statut :", error);
      setStatus("Erreur de chargement");
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [orderId]); // Récupérer le statut lorsque l'ID de la commande change

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