// Dans ClientService.ts

static async sendWelcomeEmail(email: string, name: string, password: string): Promise<void> {
    try {
      const functionUrl = 'https://your-region-your-project.cloudfunctions.net/sendClientCredentials';
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          password
        }),
      });
  
      if (!response.ok) {
        throw new Error('Échec de l\'envoi de l\'email');
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email:", error);
      throw error;
    }
  }
  
  static async createUserAccount(
    email: string, 
    password: string, 
    clientId: string
  ): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      const user = userCredential.user;
  
      const userData = {
        uid: user.uid,
        email,
        role: "destinataire",
        clientId
      };
  
      await setDoc(doc(firebasestore, "users", user.uid), userData);
      await sendEmailVerification(user);
      
      // Envoyer l'email avec les identifiants
      await this.sendWelcomeEmail(email, userData.name || 'Client', password);
  
      return userData;
    } catch (error) {
      console.error("Error creating user account:", error);
      throw error;
    }
  };