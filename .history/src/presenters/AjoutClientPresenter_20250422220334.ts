// src/presenters/AjoutClientPresenter.ts
import { Dispatch } from "react";
import { ClientModel } from "../models/ClientModel";
import { addClient, setError, setLoading } from "../redux/clientSlice";
import { generateRandomPassword, registerUser } from "../services/authService";
import { createClientInFirestore, getAndUpdateClientCounter } from "../services/clientService";

export const handleClientSubmit = async (
  clientData: Omit<ClientModel, "id" | "createdAt">,
  dispatch: Dispatch<any>,
  navigation: any,
  setLocalLoading: (loading: boolean) => void
) => {
  const { name, phone, email, address } = clientData;

  if (!name || !phone || !email || !address) {
    alert("Veuillez remplir tous les champs");
    return;
  }

  try {
    setLocalLoading(true);
    dispatch(setLoading(true));

    // Générer un mot de passe aléatoire
    const password = generateRandomPassword();

    // Créer le compte utilisateur
    await registerUser(email, password, "destinataire");

    // Créer le client dans Firestore
    const newId = await getAndUpdateClientCounter();

    const newClient: ClientModel = {
      id: newId.toString(),
      name,
      phone,
      email,
      address,
      createdAt: new Date().toISOString(),
    };

    const docId = await createClientInFirestore(newClient);

    dispatch(addClient({ ...newClient, id: docId }));

    alert(`Client ajouté avec succès. Un email de bienvenue a été envoyé à ${email}`);
    navigation.goBack();
  } catch (error: any) {
    console.error("Erreur ajout client :", error);
    let errorMessage = "Erreur lors de l'ajout du client";
    
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = "Cet email est déjà utilisé par un autre compte";
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = "L'adresse email est invalide";
    }
    
    dispatch(setError(errorMessage));
    alert(errorMessage);
  } finally {
    setLocalLoading(false);
    dispatch(setLoading(false));
  }
};