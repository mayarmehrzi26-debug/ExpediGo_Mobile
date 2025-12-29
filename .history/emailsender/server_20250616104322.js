require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuration avancée du transporteur Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'sandbox.smtp.mailtrap.io',
  port: process.env.MAIL_PORT || 2525,
  secure: false,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  },
  tls: {
    rejectUnauthorized: false // Pour le développement seulement
  }
});

// Middleware CORS sécurisé
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:8081',
      'exp://192.168.117.160:19000',
      'http://192.168.117.160',
      'http://20.20.0.63',
      /\.yourapp\.com$/ // Regex pour tous les sous-domaines
    ];
    
    if (!origin || allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return origin.startsWith(allowed);
      }
      return allowed.test(origin);
    })) {
      callback(null, true);
    } else {
      console.warn('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Pré-vol pour toutes les routes

// Middlewares
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev')); // Logging des requêtes

// Middleware de sécurité de base
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  next();
});

// Route de santé
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime(),
    dbStatus: 'connected', // À adapter selon votre DB
    mailService: transporter.verify() ? 'ready' : 'error'
  });
});

// Route ping détaillée
app.get('/ping', (req, res) => {
  res.json({
    status: 'alive',
    serverTime: new Date().toISOString(),
    client: {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      origin: req.get('origin')
    },
    environment: process.env.NODE_ENV || 'development'
  });
});

// Route d'envoi d'email de bienvenue
app.post('/send-welcome-email', async (req, res) => {
  try {
    const { email, name, password, address } = req.body;

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
          <p>Votre compte client a été créé avec succès sur ExpediGo.</p>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Email:</strong> ${email}</p>
            ${password ? `<p><strong>Mot de passe temporaire:</strong> ${password}</p>` : ''}
            ${address ? `<p><strong>Adresse:</strong> ${address}</p>` : ''}
          </div>
          
          <p style="text-align: center;">
            <a href="${process.env.APP_URL || 'http://localhost:3000'}/login" 
               style="background: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Se connecter
            </a>
          </p>
          
          <p style="margin-top: 30px; font-size: 0.9em; color: #7f8c8d;">
            Cordialement,<br/>L'équipe ExpediGo
          </p>
        </div>
      `,
      text: `Bonjour ${name},\n\nVotre compte a été créé avec succès.\n\nEmail: ${email}\n${password ? `Mot de passe temporaire: ${password}\n` : ''}${address ? `Adresse: ${address}\n` : ''}\nConnectez-vous: ${process.env.APP_URL || 'http://localhost:3000'}/login\n\nCordialement,\nL'équipe ExpediGo`
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email envoyé:', info.messageId);
    res.json({ 
      success: true,
      messageId: info.messageId
    });

  } catch (error) {
    console.error('Erreur d\'envoi d\'email:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Route d'envoi d'email de livraison
app.post('/send-delivery-email', async (req, res) => {
  try {
    const { email, deliveryId, qrCodeUrl } = req.body;

    if (!email || !deliveryId) {
      return res.status(400).json({
        success: false,
        error: 'Email and deliveryId are required'
      });
    }

    const mailOptions = {
      from: `"ExpediGo" <${process.env.MAIL_FROM || 'no-reply@expedigo.com'}>`,
      to: email,
      subject: 'Votre livraison ExpediGo #' + deliveryId,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Votre livraison #${deliveryId}</h2>
          <p>Votre colis a été enregistré avec succès.</p>
          
          ${qrCodeUrl ? `
          <div style="text-align: center; margin: 20px 0;">
            <p>Scanner ce QR code pour suivre votre livraison:</p>
            <img src="${qrCodeUrl}" alt="QR Code de suivi" style="width: 200px; height: 200px;"/>
          </div>
          ` : ''}
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Numéro de suivi:</strong> ${deliveryId}</p>
            <p><strong>Statut:</strong> En préparation</p>
          </div>
          
          <p style="text-align: center;">
            <a href="${process.env.APP_URL || 'http://localhost:3000'}/tracking/${deliveryId}" 
               style="background: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Suivre ma livraison
            </a>
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    res.json({ success: true, messageId: info.messageId });

  } catch (error) {
    console.error('Erreur d\'envoi d\'email de livraison:', error);
    res.status(500).json({
      success: false,
      error: error.message
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

// Gestion centrale des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur globale:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Démarrage du serveur
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS allowed origins: ${corsOptions.origin.toString()}`);
});

// Gestion propre des arrêts
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = server;