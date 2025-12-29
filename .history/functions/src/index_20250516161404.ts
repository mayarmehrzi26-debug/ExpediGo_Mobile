const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
admin.initializeApp();

// Configuration SMTP
const gmailEmail = functions.config().smtp.email;
const gmailPassword = functions.config().smtp.password;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailEmail,
    pass: gmailPassword
  }
});

exports.sendClientCredentials = functions.https.onCall(async (data, context) => {
  // Vérification de l'authentification
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated', 
      'Seuls les utilisateurs authentifiés peuvent envoyer des emails'
    );
  }

  const { email, name, password } = data;

  try {
    const mailOptions = {
      from: `"Votre Application" <${gmailEmail}>`,
      to: email,
      subject: 'Vos identifiants de connexion',
      html: `
        <h1>Bienvenue ${name} !</h1>
        <p>Voici vos identifiants :</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Mot de passe :</strong> ${password}</p>
        <p>Ce mot de passe est temporaire, veuillez le changer après connexion.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Erreur:', error);
    throw new functions.https.HttpsError(
      'internal', 
      'Échec de l\'envoi de l\'email'
    );
  }
});