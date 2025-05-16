


const functions = require("firebase-functions");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");

admin.initializeApp();
sgMail.setApiKey("YOUR_SENDGRID_API_KEY"); // Remplacez par votre clé API SendGrid

exports.sendDeliveryEmail = functions.firestore
  .document("livraisons/{orderId}")
  .onUpdate(async (change, context) => {
    const orderData = change.after.data();
    const clientId = orderData.client;

    // Récupérer l'email du client depuis Firestore
    const clientSnapshot = await admin.firestore().collection("clients").doc(clientId).get();
    const clientEmail = clientSnapshot.data()?.email;

    if (clientEmail) {
      const msg = {
        to: clientEmail,
        from: "mayarmehrzi22@gmail.com", // Remplacez par l'adresse email que vous utilisez
        subject: `Votre colis est livré !`,
        text: `Le livreur a pris votre colis. Voici votre ID de colis: ${orderData.id}. Vous pouvez suivre votre colis dans notre application.`,
      };

      try {
        await sgMail.send(msg);
        console.log("Email envoyé avec succès");
      } catch (error) {
        console.error("Erreur lors de l'envoi de l'email:", error);
      }
    } else {
      console.log("Client sans email trouvé");
    }
  });
