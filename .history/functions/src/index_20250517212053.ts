import * as admin from "firebase-admin";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as functions from "firebase-functions/v1";
import * as nodemailer from "nodemailer";

admin.initializeApp();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: functions.config().gmail.email,
    pass: functions.config().gmail.password,
  },
});

export const sendWelcomeEmail = onDocumentCreated(
  "clients/{clientId}",
  async (event) => {
    const snap = event.data;
    if (!snap) {
      console.log("No data associated with the event");
      return;
    }

    const clientData = snap.data();

    try {
      const mailOptions = {
        from: "mayamehrzi8@gmail.com",
        to: clientData.email,
        subject: "Bienvenue sur notre application",
        html: `
          <h1>Bienvenue ${clientData.name}!</h1>
          <p>Voici vos informations de connexion :</p>
          <p><strong>Email:</strong> ${clientData.email}</p>
          <p><strong>Mot de passe temporaire:</strong> ${event.params.clientId}</p>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log("Email envoyé avec succès");
      return snap.ref.update({ welcomeEmailSent: true });
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email:", error);
      await snap.ref.delete();
      throw new functions.https.HttpsError("internal", "Échec de l'envoi de l'email");
    }
  }
);