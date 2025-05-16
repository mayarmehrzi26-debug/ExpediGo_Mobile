const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

const transporter = nodemailer.createTransport({
  service: "gmail", // Ou un autre service si tu préfères
  auth: {
    user: "ihebmehrzi19966@gmail.com",
    pass: "Iheb2222*", // Utilise un mot de passe d'application pour Gmail
  },
});

exports.sendDeliveryConfirmation = functions.firestore
  .document("Orders/{orderId}")
  .onCreate(async (snap, context) => {
    const order = snap.data();
    
    if (!order.clientEmail) {
      console.log("Aucun email client trouvé.");
      return null;
    }

    const mailOptions = {
      from: "ihebmehrzi19966@gmail.com",
      to: order.clientEmail,
      subject: "Votre commande a été confirmée",
      text: `Bonjour,\n\nVotre commande N°${context.params.orderId} a été confirmée et est en cours de livraison.\n\nMerci de votre confiance!\n\nCordialement, \nL'équipe de livraison`
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("Email envoyé avec succès à", order.clientEmail);
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email:", error);
    }

    return null;
  });
