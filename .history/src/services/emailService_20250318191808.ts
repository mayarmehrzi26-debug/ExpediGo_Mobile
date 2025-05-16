const sendEmail = async (title, email, message, attachment) => {
  const serviceId = "service_5eu5z5n"; // Remplacez par votre Service ID
  const templateId = "template_vemnwnk"; // Remplacez par votre Template ID
  const publicKey = "mdxWC4oGOxMbdEJOn"; // Remplacez par votre Public Key Email.js
  const url = 'https://api.emailjs.com/api/v1.0/email/send';

  const payload = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    template_params: {
      title,
      email,
      message,
    },
  };

  // Ajout de l'image en tant que pièce jointe
  if (attachment) {
    const formData = new FormData();
    formData.append('attachment', {
      uri: URL.createObjectURL(attachment), // Convertir le blob en URI
      name: 'qrcode.png',
      type: 'image/png',
    });
    payload.attachment = formData;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Erreur API Email.js : ${errorData}`);
    }

    console.log("Email envoyé avec succès !");
  } catch (error) {
    console.error("Erreur lors de l’envoi de l’email :", error);
    throw error;
  }
};