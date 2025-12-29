const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');
admin.initializeApp();

// Configurer le transporteur Gmail (gratuit)
const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailEmail,
    pass: gmailPassword
  }
});

exports.sendWelcomeEmail = functions.firestore
  .document('clients/{clientId}')
  .onCreate(async (snapshot, context) => {
    const clientData = snapshot.data();
    const clientId = context.params.clientId;

    // Récupérer le mot de passe depuis le document utilisateur
    const userSnapshot = await admin.firestore()
      .collection('users')
      .where('clientId', '==', clientId)
      .limit(1)
      .get();

    if (userSnapshot.empty) return null;
    const userData = userSnapshot.docs[0].data();

    const mailOptions = {
      from: `"Votre Application" <${gmailEmail}>`,
      to: clientData.email,
      subject: 'Vos identifiants de connexion',
      html: `
        <h1>Bienvenue ${clientData.name} !</h1>
        <p>Voici vos identifiants pour accéder à notre application :</p>
        <p><strong>Email :</strong> ${clientData.email}</p>
        <p><strong>Mot de passe temporaire :</strong> ${userData.tempPassword}</p>
        <p style="color: red;">Ce mot de passe est temporaire, veuillez le changer après connexion.</p>
        <p>Cordialement,<br/>L'équipe de support</p>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Email envoyé à:', clientData.email);
      return null;
    } catch (error) {
      console.error("Erreur d'envoi:", error);
      return null;
    }
  });