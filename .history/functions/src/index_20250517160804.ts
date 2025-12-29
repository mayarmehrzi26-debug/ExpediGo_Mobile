const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

// Configurer le transporteur Gmail/Outlook
const transporter = nodemailer.createTransport({
  service: "gmail", // Ou "outlook"
  auth: {
    user: "mayamehrzi8@gmail.com", // Votre email
    pass: "mnkxdryotzuze", // Mot de passe d'application (Gmail) ou mot de passe normal (Outlook)
  },
});

exports.sendClientCredentials = functions.firestore
  .document("users/{userId}")
  .onCreate(async (snap, context) => {
    const userData = snap.data();
    const clientId = userData.clientId;

    // Récupérer les infos du client
    const clientDoc = await admin.firestore().doc(`clients/${clientId}`).get();
    const clientData = clientDoc.data();

    // Options de l'email
    const mailOptions = {
      from: "votre-email@gmail.com",
      to: userData.email,
      subject: "Vos identifiants de connexion",
      html: `
        <h3>Bonjour ${clientData.name},</h3>
        <p>Voici vos identifiants pour accéder à l'application :</p>
        <ul>
          <li><strong>Email :</strong> ${userData.email}</li>
          <li><strong>Mot de passe :</strong> ${context.params.password}</li>
        </ul>
        <p>Vous pouvez vous connecter <a href="https://votre-app.com/login">ici</a>.</p>
        <p>Cordialement,<br/>L'équipe de support</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("Email envoyé avec succès !");
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email :", error);
      throw new Error("Échec de l'envoi de l'email");
    }
  });