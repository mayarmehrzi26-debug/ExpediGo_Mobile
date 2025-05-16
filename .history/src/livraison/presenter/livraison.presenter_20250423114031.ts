import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectAdresses, selectClients, selectDeliveryForm, selectProducts } from "../livraison.selectors";
import {
  fetchAdresses,
  fetchClients,
  fetchDefaultStatus,
  fetchProducts,
  saveDelivery
} from "../service/livraison.service";
import {
  setAdresses,
  setClients,
  setDefaultStatus,
  setDeliveryField,
  setProducts
} from "../store/livraison.actions";

export const useLivraisonPresenter = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const form = useSelector(selectDeliveryForm);
  const products = useSelector(selectProducts);
  const clients = useSelector(selectClients);
  const adresses = useSelector(selectAdresses);

  // Chargement des données initiales
  useEffect(() => {
    const loadInitialData = async () => {
      const [productsData, clientsData, adressesData, defaultStatus] = await Promise.all([
        fetchProducts(),
        fetchClients(),
        fetchAdresses(),
        fetchDefaultStatus()
      ]);
      
      dispatch(setProducts(productsData));
      dispatch(setClients(clientsData));
      dispatch(setAdresses(adressesData));
      dispatch(setDefaultStatus(defaultStatus));
    };

    loadInitialData();
  }, [dispatch]);

  const handleFieldChange = (field: string, value: any) => {
    dispatch(setDeliveryField({ field, value }));
  };

  const handleSaveDelivery = async () => {
    if (!form.address || !form.client || !form.product || !form.payment) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    try {
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${Math.floor(Math.random() * 1000000)}&size=200x200`;
      
      await saveDelivery({
        ...form,
        qrCodeUrl,
      });

      alert("Livraison enregistrée avec succès !");
      navigation.goBack();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
      alert("Une erreur s'est produite");
    }
  };

  return {
    form,
    products,
    clients,
    adresses,
    handleFieldChange,
    handleSaveDelivery,
  };
};