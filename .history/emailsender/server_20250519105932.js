// Remplacez la configuration Nodemailer par MailJS
const emailjs = require('@emailjs/nodejs');

// Configurez MailJS (à mettre dans vos variables d'environnement)
const MAILJS_SERVICE_ID = process.env.MAILJS_SERVICE_ID;
const MAILJS_TEMPLATE_ID = process.env.MAILJS_TEMPLATE_ID;
const MAILJS_PUBLIC_KEY = process.env.MAILJS_PUBLIC_KEY;
const MAILJS_PRIVATE_KEY = process.env.MAILJS_PRIVATE_KEY;

// Modifiez la route d'envoi d'email
app.post('/send-welcome-email', async (req, res) => {
  const { email, name, password, address } = req.body;

  try {
    await emailjs.send(
      MAILJS_SERVICE_ID,
      MAILJS_TEMPLATE_ID,
      {
        to_email: email,
        to_name: name,
        from_name: "ExpediGo",
        address: address,
        password: password
      },
      {
        publicKey: MAILJS_PUBLIC_KEY,
        privateKey: MAILJS_PRIVATE_KEY
      }
    );

    res.status(200).json({ success: true, message: 'Email envoyé avec succès' });
  } catch (error) {
    console.error('Erreur MailJS:', error);
    res.status(500).json({ success: false, error: 'Échec de l\'envoi de l\'email' });
  }
});