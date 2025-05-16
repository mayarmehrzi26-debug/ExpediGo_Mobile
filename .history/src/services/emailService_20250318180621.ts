const sendEmail = async (title: string, name: string, email: string): Promise<void> => {
  const serviceId = "service_5eu5z5n"; // Remplacez par votre Service ID
  const templateId = "template_vemnwnk"; // Remplacez par votre Template ID
  const publicKey = "mdxWC4oGOxMbdEJOn"; // Remplacez par votre Public Key Email.js
  const url = `https://api.emailjs.com/api/v1.0/email/send`;

  const payload = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey, // Email.js attend `user_id` et non `publicKey`
    template_params: {
      title,
      name,
      email,
    },
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Erreur API Email.js : ${errorData}`);
    }

    console.log("Email envoyé avec succès !");
  } catch (error) {
    console.error("Erreur lors de l’envoi de l’email :", error);
    throw error;
  }
};

const handleConfirmDelivery = async () => {
  if (selectedOrder) {
    try {
      const orderRef = doc(firebasestore, "livraisons", selectedOrder.id);
      const newOrderRef = doc(firebasestore, "Orders", selectedOrder.id);

      const orderSnapshot = await getDoc(orderRef);
      if (!orderSnapshot.exists()) {
        console.error("Commande introuvable !");
        return;
      }

      const orderData = orderSnapshot.data();

      // 🔹 Récupérer l'email du client
      const clientRef = doc(firebasestore, "clients", orderData.client);
      const clientSnapshot = await getDoc(clientRef);
      const clientEmail = clientSnapshot.exists() ? clientSnapshot.data().email : null;

      // Vérification de l'email du client
      if (!clientEmail) {
        console.error("Email du client introuvable ou vide !");
        return; // Ne pas envoyer l'email si l'email est vide
      }

      // 🔹 Copier la commande dans "Orders"
      await setDoc(newOrderRef, {
        ...orderData,
        status: "En attente",
        deliveredAt: Timestamp.now(),
      });

      // 🔹 Supprimer l'ancienne commande
      await deleteDoc(orderRef);

      // 🔹 Envoyer l'email au client (exemple : "Votre colis est pris en charge")
      await sendEmail("Votre colis est pris en charge", orderData.clientName, clientEmail);

      // 🔹 Mettre à jour l'UI
      setOrders(prevOrders => prevOrders.filter(order => order.id !== selectedOrder.id));
      setModalVisible(false);
    } catch (error) {
      console.error("Erreur lors de la confirmation de la livraison :", error);
    }
  }
};
