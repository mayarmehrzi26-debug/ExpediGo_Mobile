
import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
admin.initializeApp();

// Configurez le transporteur email (utilisez un service comme Gmail, Mailgun, etc.)
const transporter = nodemailer.createTransport({
  service: 'gmail', // ou un autre service
  auth: {
    user: functions.config().gmail.email,
    pass: functions.config().gmail.password,
  },
});

exports.sendWelcomeEmail = functions.firestore
  .document('clients/{clientId}')
  .onCreate(async (snap, context) => {
    const clientData = snap.data();
    const clientId = context.params.clientId;
    
    try {
      const mailOptions = {
        from: 'votre-email@gmail.com',
        to: clientData.email,
        subject: 'Bienvenue sur notre application',
        html: `
          <h1>Bienvenue ${clientData.name}!</h1>
          <p>Voici vos informations de connexion :</p>
          <p><strong>Email:</strong> ${clientData.email}</p>
          <p><strong>Mot de passe temporaire:</strong> ${context.params.password}</p>
          <p>Veuillez changer votre mot de passe après votre première connexion.</p>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log('Email envoyé avec succès');
      
      // Mettre à jour le client pour indiquer que l'email a été envoyé
      return snap.ref.update({ welcomeEmailSent: true });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      
      // Supprimer le client si l'email n'a pas pu être envoyé
      await snap.ref.delete();
      throw new functions.https.HttpsError('internal', 'Échec de l\'envoi de l\'email');
    }
  });
