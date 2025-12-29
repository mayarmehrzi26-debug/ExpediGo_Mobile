require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuration CORS avec origines spécifiques
const corsOptions = {
  origin: [
    'http://192.168.117.160',
    'http://localhost',       
    'http://localhost:8080'  // Pour React Native debug
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuration du transporteur Nodemailer avec Mailtrap
const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  },
  connectionTimeout: 5000, // 5s timeout
  greetingTimeout: 5000,
  socketTimeout: 5000
});

// Route de test de santé
app.get('/ping', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'ExpediGo Backend'
  });
});

// Route pour envoyer les emails de bienvenue
app.post('/send-welcome-email', async (req, res) => {
  const { email, name, password, address } = req.body;

  // Validation des données
  if (!email || !name || !password || !address) {
    return res.status(400).json({ 
      success: false, 
      error: 'Tous les champs sont requis' 
    });
  }

  const mailOptions = {
    from: '"ExpediGo" <expedigo@support.com>',
    to: email,
    subject: 'Bienvenue sur ExpediGo',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4a4a4a;">Bonjour ${name},</h2>
        <p>Votre compte client a été créé avec succès sur notre plateforme ExpediGo.</p>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Vos identifiants :</h3>
          <p><strong>Adresse :</strong> ${address}</p>
          <p><strong>Email :</strong> ${email}</p>
          <p><strong>Mot de passe temporaire :</strong> ${password}</p>
        </div>
        
        <p style="font-size: 0.9em; color: #666;">
          Pour des raisons de sécurité, nous vous recommandons de changer votre mot de passe après votre première connexion.
        </p>
        
        <p>Cordialement,<br/><strong>L'équipe ExpediGo</strong></p>
      </div>
    `,
    text: `Bonjour ${name},\n\nVotre compte client a été créé avec succès.\n\nAdresse: ${address}\nEmail: ${email}\nMot de passe temporaire: ${password}\n\nConnectez-vous dès maintenant à notre application.\n\nCordialement,\nL'équipe ExpediGo`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email envoyé:', info.messageId);
    res.status(200).json({ 
      success: true, 
      message: 'Email envoyé avec succès',
      messageId: info.messageId 
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Échec de l\'envoi de l\'email',
      details: error.message 
    });
  }
});

// Route pour envoyer les emails de livraison avec QR code
app.post('/send-delivery-email', async (req, res) => {
  const { email, deliveryId, qrCodeUrl } = req.body;

  if (!email || !deliveryId || !qrCodeUrl) {
    return res.status(400).json({ 
      success: false, 
      error: 'Email, deliveryId et qrCodeUrl sont requis' 
    });
  }

  const mailOptions = {
    from: '"ExpediGo" <expedigo@support.com>',
    to: email,
    subject: `Votre livraison #${deliveryId} a été créée`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4a4a4a;">Votre livraison a été enregistrée</h2>
        <p>Voici les détails de suivi de votre commande :</p>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Informations de suivi :</h3>
          <p><strong>Numéro de suivi :</strong> ${deliveryId}</p>
          
          <p style="text-align: center;">
            <img src="${qrCodeUrl}" alt="QR Code de suivi" style="width:200px; height:200px; border: 1px solid #ddd;"/>
          </p>
          
          <p style="font-size: 0.9em;">
            Scannez ce QR code pour suivre votre livraison en temps réel.
          </p>
        </div>
        
        <p>Cordialement,<br/><strong>L'équipe ExpediGo</strong></p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    res.status(200).json({ 
      success: true, 
      message: 'Email de suivi envoyé avec succès',
      messageId: info.messageId 
    });
  } catch (error) {
    console.error('Erreur envoi email livraison:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Échec de l\'envoi de l\'email de suivi',
      details: error.message 
    });
  }
});

// Gestion des erreurs 404
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint non trouvé'
  });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Erreur interne du serveur',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Démarrer le serveur
const server = app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
  console.log(`Environnement: ${process.env.NODE_ENV || 'development'}`);
});

// Gestion propre des arrêts
process.on('SIGTERM', () => {
  console.log('Reçu SIGTERM. Arrêt gracieux du serveur');
  server.close(() => {
    console.log('Serveur arrêté');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Reçu SIGINT. Arrêt gracieux du serveur');
  server.close(() => {
    console.log('Serveur arrêté');
    process.exit(0);
  });
});

module.exports = server;