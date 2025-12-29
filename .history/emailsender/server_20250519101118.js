require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuration CORS avec origines spécifiques
app.use(cors({
  origin: [
    'http://localhost:3000', // typique pour React en développement
    'http://192.168.196.160:3000', // ajoutez le port si nécessaire
    'http://192.168.196.160:3001',
    'http://192.168.16.160', 
    'exp://192.168.196.160:19000',
    'exp://192.168.16.160:19000',

  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Autres middlewares
app.use(bodyParser.json());

// Configuration du transporteur Nodemailer avec Mailtrap
const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  }
});

// Route de test
app.get('/', (req, res) => {
  res.send('Backend opérationnel');
});

// Route pour envoyer les emails de bienvenue
app.post('/send-welcome-email', async (req, res) => {
  const { email, name, password, address } = req.body;

  const mailOptions = {
    from: '"Votre Application" <mayar>',
    to: email,
    subject: 'Bienvenue sur notre application',
    html: `
      <h2>Bonjour ${name},</h2>
      <p>Votre compte client a été créé avec succès.</p>
      <p><strong>Adresse:</strong> ${address}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Mot de passe temporaire:</strong> ${password}</p>
      <p>Connectez-vous dès maintenant à notre application.</p>
      <p>Cordialement,<br/>L'équipe support</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Email envoyé avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    res.status(500).json({ success: false, error: 'Échec de l\'envoi de l\'email' });
  }
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});