import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import Svg, { Circle, Rect, Text } from "react-native-svg";
import { firebasestore } from "../../FirebaseConfig";



const StatusBadge: React.FC<StatusBadgeProps> = ({ deliveryId }) => {
  const [statusText, setStatusText] = useState("Chargement...");
  
  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const q = query(collection(firebasestore, "livraisons"));
    
      const querySnapshot = await getDocs(q);

        const deliveriesList = await Promise.all(querySnapshot.docs.map(async (doc) => {
          const data = doc.data();

          const productSnapshot = await getDocs(collection(firebasestore, "products"));
          const productData = productSnapshot.docs.find(productDoc => productDoc.id === data.product)?.data();

          const clientSnapshot = await getDocs(collection(firebasestore, "clients"));
          const clientData = clientSnapshot.docs.find(clientDoc => clientDoc.id === data.client)?.data();

          const addressSnapshot = await getDocs(collection(firebasestore, "adresses"));
          const addressData = addressSnapshot.docs.find(addressDoc => addressDoc.id === data.address)?.data();

          const date = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toLocaleDateString() : data.date || "Date inconnue";

          const statusSnapshot = await getDocs(collection(firebasestore, "Status"));
          const statusData = statusSnapshot.docs.find(statusdocs => statusdocs.id === data.status)?.data();
          const numericId = extractNumericId(doc.id);

          return {
            id: numericId,
            client: clientData?.name || "Client inconnu",
            address: addressData?.address || "Adresse inconnue",
            product: productData?.name || "Produit inconnu",
            payment: productData?.amount,
            isExchange: data.isExchange,
            isFragile: data.isFragile,
            productImage: productData?.imageUrl || null,
            date,
            status: statusData?.nomStat , // Ajouter un champ "status"
          };
        }));

        setDeliveries(deliveriesList);
      } catch (error) {
        console.error("Error fetching deliveries:", error);
      }
    };

    fetchDeliveries();
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