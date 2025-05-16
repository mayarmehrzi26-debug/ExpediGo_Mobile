import emailjs from "@emailjs/browser";

const sendEmail = async (title: string, name: string, email: string): Promise<void> => {
  const serviceId = "service_5eu5z5n"; // Remplacez par votre Service ID
  const templateId = "template_vemnwnk"; // Remplacez par votre Template ID
  const publicKey = "votre_public_key"; // Remplacez par votre Public Key Email.js

  const templateParams = {
    title,
    name,
    email,
  };

  try {
    const response = await emailjs.send(serviceId, templateId, templateParams, publicKey);
    console.log("Email envoyé avec succès !", response);
  } catch (error) {
    console.error("Erreur lors de l’envoi de l’email :", error);
    throw error;
  }
};

export default sendEmail;
