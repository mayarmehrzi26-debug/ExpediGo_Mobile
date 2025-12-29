require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuration CORS permissive pour le développement
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());

// Configuration Mailtrap
const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  }
});

// Middleware de logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Origin:', req.headers.origin);
  next();
});

// Route test
app.get('/ping', (req, res) => {
  res.json({ status: 'alive', timestamp: new Date() });
});

// Route unique pour l'envoi d'emails
app.post('/send-welcome-email', async (req, res) => {
  const { email, name, password, address } = req.body;
  console.log('Nouvelle demande email:', { email, name });

  const mailOptions = {
    from: '"ExpediGo" <no-reply@expedigo.com>',
    to: email,
    subject: 'Bienvenue sur ExpediGo',
    html: `
      <h2>Bonjour ${name},</h2>
      <p>Votre compte a été créé avec succès.</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Mot de passe temporaire:</strong> ${password}</p>
      <p>Cordialement,<br/>L'équipe ExpediGo</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email envoyé avec succès à', email);
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur d\'envoi:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});
// Ajoutez cette nouvelle route dans votre serveur
app.post('/send-delivery-email', async (req, res) => {
  const { email, deliveryId, qrCodeUrl } = req.body;
  const mailOptions = {
    from: '"ExpediGo" <mayarmehrzi22@gmail.com>',
    to: email,
    subject: 'Votre livraison a été créée - Suivi de commande',
    html: `
      <h2>Votre livraison a été enregistrée avec succès</h2>
      <p>Voici les détails de suivi de votre commande :</p>
      
      <p><strong>Numéro de suivi :</strong> ${deliveryId}</p>
      
      <p>Vous pouvez scanner ce QR code pour suivre votre livraison :</p>
      <img src="${qrCodeUrl}" alt="QR Code de suivi" style="width:200px;height:200px;"/>
      
      <p>Merci de nous avoir choisi pour votre livraison.</p>
      <p>Cordialement,<br/>L'équipe ExpediGo</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Email de suivi envoyé avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    res.status(500).json({ success: false, error: 'Échec de l\'envoi de l\'email de suivi' });
  }
});
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur démarré sur http://0.0.0.0:${PORT}`);
});