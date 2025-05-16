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

    // Générer un mot de passe sécurisé
    const password = generateRandomPassword();

    // 1. Créer le compte utilisateur avec rôle
    const userCredential = await registerUser(email, password, "destinataire", {
      name,
      phone,
      address
    });

    // 2. Créer l'entrée client dans la collection clients
    const newId = await getAndUpdateClientCounter();
    
    const newClient: ClientModel = {
      id: newId.toString(),
      name,
      phone,
      email,
      address,
      createdAt: new Date().toISOString(),
      userId: userCredential.user.uid // Utilisez l'UID du userCredential retourné
    };

    const docId = await createClientInFirestore(newClient);
    dispatch(addClient({ ...newClient, id: docId }));

    alert(`
      Client ajouté avec succès!
      Un email de bienvenue a été envoyé à ${email}.
      Mot de passe temporaire: ${password}
    `);
    
    navigation.goBack();
  } catch (error: any) {
    console.error("Erreur:", error);
    
    let errorMessage = "Erreur lors de l'ajout";
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = "Cet email est déjà utilisé";
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = "Email invalide";
    }
    
    dispatch(setError(errorMessage));
    alert(errorMessage);
  } finally {
    setLocalLoading(false);
    dispatch(setLoading(false));
  }
};