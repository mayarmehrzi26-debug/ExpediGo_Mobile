const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const cors = require('cors')({origin: true});

admin.initializeApp();

// Configuration SMTP (exemple pour Gmail)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true pour le port 465
  auth: {
    user: functions.config().smtp.user,
    pass: functions.config().smtp.password
  }
});

exports.sendClientCredentials = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    const { email, name, password } = req.body;

    const mailOptions = {
      from: '"Votre Application" <votre-email@gmail.com>',
      to: email,
      subject: 'Vos identifiants de connexion',
      html: `
        <h1>Bienvenue ${name} !</h1>
        <p>Voici vos identifiants pour accéder à notre application :</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Mot de passe :</strong> ${password}</p>
        <p>Nous vous recommandons de changer votre mot de passe après votre première connexion.</p>
        <p>Cordialement,<br/>L'équipe de support</p>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      return res.status(200).send('Email envoyé avec succès');
    } catch (error) {
      console.error('Erreur d\'envoi d\'email:', error);
      return res.status(500).send('Erreur lors de l\'envoi de l\'email');
    }
  });
});