const exportSelectedDeliveries = async () => {
  const selectedDeliveries = filteredDeliveries.filter(delivery => selectedCards[delivery.id]);

  if (selectedDeliveries.length === 0) {
    Alert.alert("Aucune sélection", "Veuillez sélectionner au moins une livraison à exporter.");
    return;
  }

  Alert.alert(
    "Exporter en PDF",
    "Voulez-vous exporter les livraisons sélectionnées en PDF ?",
    [
      {
        text: "Annuler",
        style: "cancel"
      },
      { 
        text: "Exporter", 
        onPress: async () => {
          try {
            const htmlContent = `
              <h1>Liste des livraisons</h1>
              ${selectedDeliveries.map(delivery => `
                <div>
                  <h2>Livraison #${delivery.id}</h2>
                  <p><strong>Client:</strong> ${delivery.client}</p>
                  <p><strong>Adresse:</strong> ${delivery.address}</p>
                  <p><strong>Produit:</strong> ${delivery.product}</p>
                  <p><strong>Paiement:</strong> ${delivery.payment} DT</p>
                  <p><strong>Date:</strong> ${delivery.date}</p>
                  <hr>
                </div>
              `).join('')}
            `;

            const options = {
              html: htmlContent,
              fileName: `livraisons_${new Date().toISOString().split('T')[0]}`,
              directory: 'Documents',
            };

            if (!RNHTMLtoPDF) {
              throw new Error("RNHTMLtoPDF n'est pas correctement initialisé.");
            }

            const file = await RNHTMLtoPDF.convert(options);
            Alert.alert("Succès", `PDF exporté avec succès: ${file.filePath}`);
          } catch (error) {
            console.error("Erreur lors de l'exportation en PDF:", error);
            Alert.alert("Erreur", "Une erreur s'est produite lors de l'exportation en PDF.");
          }
        }
      }
    ]
  );
};