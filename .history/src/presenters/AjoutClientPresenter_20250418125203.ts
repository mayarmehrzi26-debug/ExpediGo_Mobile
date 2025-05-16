// src/presenters/AjoutClientPresenter.ts
import { Dispatch } from "react";
import { ClientModel } from "../models/ClientModel";
import { addClient, setError, setLoading } from "../redux/clientSlice";
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

    alert("Client ajouté avec succès");
    navigation.goBack();
  } catch (error) {
    console.error("Erreur ajout client :", error);
    dispatch(setError("Une erreur s'est produite"));
    alert("Erreur lors de l'ajout du client");
  } finally {
    setLocalLoading(false);
    dispatch(setLoading(false));
  }
};
