import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { 
  fetchProducts, 
  fetchClients, 
  fetchAdresses, 
  fetchDefaultStatus,
  saveDelivery 
} from "../service//livraison.service";
import { 
  setDeliveryField, 
  setProducts, 
  setClients, 
  setAdresses, 
  setDefaultStatus 
} from "../store/livraison.actions";
import { selectDeliveryForm, selectProducts, selectClients, selectAdresses } from "../store/livraison.selectors";
import { useEffect } from "react";

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