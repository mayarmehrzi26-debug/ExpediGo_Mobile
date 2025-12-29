const sendEmail = async (title: string, email: string, message: string): Promise<void> => {
  const serviceId = "service_vbxwcob";
  const templateId = "template_yb2lhbc";
  const publicKey = "0hOHIDhc7WYuaqmj4";
  const url = 'https://api.emailjs.com/api/v1.0/email/send';

  const payload = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    template_params: {
      from_name: title,  // Changed from 'title' to 'from_name' which is more standard
      to_email: email,   // Changed to 'to_email' which is typically expected
      message: message
    },
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json(); // Changed to .json() from .text()
      throw new Error(`EmailJS API Error: ${JSON.stringify(errorData)}`);
    }

    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export default sendEmail;