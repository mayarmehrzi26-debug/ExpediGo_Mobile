const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
admin.initializeApp();

// Configurer le transport SMTP (exemple avec Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "v@gmail.com", // Remplacez par votre email Gmail
    pass: "votre-mot-de-passe", // OU utilisez un "App Password" si 2FA activé
  },
});

exports.sendClientCredentials = functions.firestore
  .document("clients/{clientId}")
  .onCreate(async (snapshot, context) => {
    const clientData = snapshot.data();
    const { email, name } = clientData;

    // Générer un mot de passe aléatoire
    const password = Math.random().toString(36).slice(-8);

    try {
      // Envoyer l'email
      await transporter.sendMail({
        from: '"Votre Application" <votre-email@gmail.com>',
        to: email,
        subject: "Vos identifiants de connexion",
        html: `
          <h3>Bonjour ${name},</h3>
          <p>Voici vos identifiants pour accéder à l'application :</p>
          <p><strong>Email :</strong> ${email}</p>
          <p><strong>Mot de passe :</strong> ${password}</p>
          <p>Connectez-vous dès maintenant !</p>
          <p>Cordialement,<br>L'équipe de votre application</p>
        `,
      });

      // Créer le compte utilisateur (optionnel, si vous voulez le faire ici)
      await admin.auth().createUser({
        email,
        password,
      });

      console.log("Email envoyé avec succès à", email);
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email :", error);
    }
  });