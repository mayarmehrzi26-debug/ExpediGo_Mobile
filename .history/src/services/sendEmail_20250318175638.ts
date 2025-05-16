import { send } from "emailjs-com";

const sendEmail = async (clientEmail: string) => {
  const serviceId = "service_5eu5z5n"; // Remplace par ton Service ID
  const templateId = "template_vemnwnk"; // Remplace par ton Template ID
  const publicKey = "mdxWC4oGOxMbdEJOn"; // Remplace par ta Public Key

  const templateParams = {
    to_email: clientEmail,
    message: "Votre colis est pris en charge.",
  };

  try {
    await send(serviceId, templateId, templateParams, publicKey);
    console.log("Email envoyé à", clientEmail);
  } catch (error) {
    console.error("Erreur lors de l’envoi de l’email :", error);
  }
};

export default sendEmail;
