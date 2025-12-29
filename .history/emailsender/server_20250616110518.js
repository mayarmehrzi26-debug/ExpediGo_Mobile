require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuration CORS étendue
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:8081',
    'exp://192.168.117.160:19000',
    'http://192.168.117.160',
    'http://20.20.0.63',
    'http://10.0.2.2'  // Pour Android emulator
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Configuration Mailtrap (pour tests)
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'sandbox.smtp.mailtrap.io',
  port: process.env.MAIL_PORT || 2525,
  auth: {
    user: process.env.MAILTRAP_USER || 'Mayar Mehrzi',
    pass: process.env.MAILTRAP_PASS || 'Mayar222222*'
  }
});

// Vérification de la connexion SMTP
transporter.verify((error) => {
  if (error) {
    console.error('Erreur de connexion SMTP:', error);
  } else {
    console.log('Serveur SMTP prêt à envoyer des emails');
  }
});

// Route de test
app.get('/ping', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date()
  });
});

// Route pour envoyer des emails
app.post('/send-welcome-email', async (req, res) => {
  try {
    const { email, name, password, address } = req.body;

    // Validation des données
    if (!email || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email and name are required'
      });
    }

    const mailOptions = {
      from: `"ExpediGo" <${process.env.MAIL_FROM || 'no-reply@expedigo.com'}>`,
      to: email,
      subject: 'Bienvenue sur ExpediGo',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Bonjour ${name},</h2>
          <p>Votre compte a été créé avec succès.</p>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Email:</strong> ${email}</p>
            ${password ? `<p><strong>Mot de passe temporaire:</strong> ${password}</p>` : ''}
            ${address ? `<p><strong>Adresse:</strong> ${address}</p>` : ''}
          </div>
          
          <p style="text-align: center;">
            <a href="${process.env.APP_URL || 'http://localhost:3000'}" 
               style="background: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Accéder à l'application
            </a>
          </p>
        </div>
      `,
      // Version texte pour les clients email simples
      text: `Bonjour ${name},\n\nVotre compte ExpediGo a été créé.\n\nEmail: ${email}\n${password ? `Mot de passe: ${password}\n` : ''}\n`
    };

    // Envoi de l'email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email envoyé:', info.messageId);
    res.json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('Erreur globale:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Démarrer le serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur démarré sur http://0.0.0.0:${PORT}`);
  console.log('Environnement:', process.env.NODE_ENV || 'development');
});